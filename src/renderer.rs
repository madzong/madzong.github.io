use bytemuck::{Pod, Zeroable};
use wgpu::{BindGroupEntry, BufferUsages, ShaderStages, include_wgsl};

#[repr(C)]
#[derive(Pod, Zeroable, Clone, Copy, Debug)]
pub struct Quad {
    pub pos: [f32; 2],
    pub size: [f32; 2],
    pub color: [f32; 4],
}

impl Quad {
    pub const LAYOUT: wgpu::VertexBufferLayout<'static> = wgpu::VertexBufferLayout {
        array_stride: size_of::<Self>() as wgpu::BufferAddress,
        step_mode: wgpu::VertexStepMode::Instance,
        attributes: &wgpu::vertex_attr_array![
            0 => Float32x2,
            1 => Float32x2,
            2 => Float32x4,
        ],
    };
}

#[derive(Clone, Copy, Debug)]
pub struct DrawCommand {
    pub quad: Quad,
    pub texture_id: TextureId,
}

#[derive(Clone, Copy, PartialEq, Eq, Debug)]
pub struct TextureId(usize);

impl TextureId {
    pub const WHITE: Self = Self(0);
}

pub struct Renderer {
    vertex_buffer: wgpu::Buffer,
    capacity: u64,

    screen_size_uniform: wgpu::Buffer,
    screen_size_group: wgpu::BindGroup,

    pipeline: wgpu::RenderPipeline,

    texture_sampler: wgpu::Sampler,
    texture_group_layout: wgpu::BindGroupLayout,
    textures: Vec<wgpu::BindGroup>,
}

impl Renderer {
    pub fn new(device: &wgpu::Device, queue: &wgpu::Queue, format: wgpu::TextureFormat) -> Self {
        let capacity = 64;
        let vertex_buffer = Self::create_vertex_buffer(&device, capacity);
        let screen_size_uniform = device.create_buffer(&wgpu::BufferDescriptor {
            label: Some("Screen size uniform"),
            size: 16,
            usage: BufferUsages::UNIFORM | BufferUsages::COPY_DST,
            mapped_at_creation: false,
        });

        let screen_size_group_layout =
            device.create_bind_group_layout(&wgpu::BindGroupLayoutDescriptor {
                label: Some("Bind group 0 layout"),
                entries: &[wgpu::BindGroupLayoutEntry {
                    binding: 0,
                    visibility: ShaderStages::VERTEX,
                    ty: wgpu::BindingType::Buffer {
                        ty: wgpu::BufferBindingType::Uniform,
                        has_dynamic_offset: false,
                        min_binding_size: None,
                    },
                    count: None,
                }],
            });

        let screen_size_group = device.create_bind_group(&wgpu::BindGroupDescriptor {
            label: Some("Bind group 0"),
            layout: &screen_size_group_layout,
            entries: &[BindGroupEntry {
                binding: 0,
                resource: wgpu::BindingResource::Buffer(
                    screen_size_uniform.as_entire_buffer_binding(),
                ),
            }],
        });

        let texture_group_layout =
            device.create_bind_group_layout(&wgpu::BindGroupLayoutDescriptor {
                label: Some("Bind group 1 layout"),
                entries: &[
                    wgpu::BindGroupLayoutEntry {
                        binding: 0,
                        visibility: ShaderStages::FRAGMENT,
                        ty: wgpu::BindingType::Texture {
                            sample_type: wgpu::TextureSampleType::Float { filterable: true },
                            view_dimension: wgpu::TextureViewDimension::D2,
                            multisampled: false,
                        },
                        count: None,
                    },
                    wgpu::BindGroupLayoutEntry {
                        binding: 1,
                        visibility: ShaderStages::FRAGMENT,
                        ty: wgpu::BindingType::Sampler(wgpu::SamplerBindingType::Filtering),
                        count: None,
                    },
                ],
            });

        let texture_sampler = device.create_sampler(&wgpu::SamplerDescriptor {
            mag_filter: wgpu::FilterMode::Linear,
            min_filter: wgpu::FilterMode::Linear,
            ..Default::default()
        });

        let pipeline_layout = device.create_pipeline_layout(&wgpu::PipelineLayoutDescriptor {
            label: Some("Pipeline layout"),
            bind_group_layouts: &[Some(&screen_size_group_layout), Some(&texture_group_layout)],
            immediate_size: 0,
        });

        let shader = device.create_shader_module(include_wgsl!("shader.wgsl"));

        let pipeline = device.create_render_pipeline(&wgpu::RenderPipelineDescriptor {
            label: Some("Render pipeline"),
            layout: Some(&pipeline_layout),
            vertex: wgpu::VertexState {
                module: &shader,
                entry_point: Some("vs_main"),
                compilation_options: wgpu::PipelineCompilationOptions::default(),
                buffers: &[Some(Quad::LAYOUT)],
            },
            primitive: wgpu::PrimitiveState {
                topology: wgpu::PrimitiveTopology::TriangleList,
                strip_index_format: None,
                front_face: wgpu::FrontFace::Ccw,
                cull_mode: None,
                unclipped_depth: false,
                polygon_mode: wgpu::PolygonMode::Fill,
                conservative: false,
            },
            depth_stencil: None,
            multisample: wgpu::MultisampleState {
                count: 1,
                mask: !0,
                alpha_to_coverage_enabled: false,
            },
            fragment: Some(wgpu::FragmentState {
                module: &shader,
                entry_point: Some("fs_main"),
                compilation_options: wgpu::PipelineCompilationOptions::default(),
                targets: &[Some(wgpu::ColorTargetState {
                    format,
                    blend: Some(wgpu::BlendState::ALPHA_BLENDING),
                    write_mask: wgpu::ColorWrites::ALL,
                })],
            }),
            multiview_mask: None,
            cache: None,
        });

        let mut renderer = Self {
            vertex_buffer,
            capacity,

            screen_size_uniform,
            screen_size_group,

            pipeline,

            texture_sampler,
            texture_group_layout,
            textures: vec![],
        };

        renderer.add_texture(device, queue, 1, 1, &[255, 255, 255, 255]);

        renderer
    }

    /// Create a vertex buffer on the GPU.
    fn create_vertex_buffer(device: &wgpu::Device, capacity: u64) -> wgpu::Buffer {
        device.create_buffer(&wgpu::BufferDescriptor {
            label: Some("Quad buffer"),
            size: capacity * size_of::<Quad>() as u64,
            usage: BufferUsages::VERTEX | BufferUsages::COPY_DST,
            mapped_at_creation: false,
        })
    }

    pub fn draw(
        &mut self,
        device: &wgpu::Device,
        queue: &wgpu::Queue,
        encoder: &mut wgpu::CommandEncoder,
        target: &wgpu::TextureView,
        screen: [f32; 2],
        cmds: &[DrawCommand],
    ) {
        let quads: Vec<Quad> = cmds.iter().map(|c| c.quad).collect();
        queue.write_buffer(
            &self.screen_size_uniform,
            0,
            bytemuck::cast_slice(&[screen[0], screen[1], 0.0, 0.0]),
        );

        let quads_len = quads.len() as u64;
        if quads_len > self.capacity {
            self.capacity = quads_len.next_power_of_two() as u64;
            self.vertex_buffer = Self::create_vertex_buffer(device, self.capacity);
        }

        queue.write_buffer(&self.vertex_buffer, 0, &bytemuck::cast_slice(&quads));

        {
            let mut pass = encoder.begin_render_pass(&wgpu::RenderPassDescriptor {
                label: Some("Render pass"),
                color_attachments: &[Some(wgpu::RenderPassColorAttachment {
                    view: target,
                    depth_slice: None,
                    resolve_target: None,
                    ops: wgpu::Operations {
                        load: wgpu::LoadOp::Clear(wgpu::Color::BLACK),
                        store: wgpu::StoreOp::Store,
                    },
                })],
                depth_stencil_attachment: None,
                timestamp_writes: None,
                occlusion_query_set: None,
                multiview_mask: None,
            });

            pass.set_pipeline(&self.pipeline);
            pass.set_bind_group(0, &self.screen_size_group, &[]);
            pass.set_vertex_buffer(0, self.vertex_buffer.slice(..));

            let mut start = 0;
            while start < cmds.len() {
                let texture = cmds[start].texture_id;
                let mut end = start + 1;

                while end < cmds.len() && cmds[end].texture_id == texture {
                    end += 1;
                }

                pass.set_bind_group(1, &self.textures[texture.0], &[]);
                pass.draw(0..6, start as u32..end as u32);
                start = end;
            }
        }
    }

    pub fn add_texture(
        &mut self,
        device: &wgpu::Device,
        queue: &wgpu::Queue,
        width: u32,
        height: u32,
        data: &[u8],
    ) -> TextureId {
        debug_assert_eq!(data.len(), (width * height * 4) as usize);

        let texture = device.create_texture(&wgpu::TextureDescriptor {
            label: Some("Texture"),
            size: wgpu::Extent3d {
                width,
                height,
                depth_or_array_layers: 1,
            },
            mip_level_count: 1,
            sample_count: 1,
            dimension: wgpu::TextureDimension::D2,
            format: wgpu::TextureFormat::Rgba8Unorm,
            usage: wgpu::TextureUsages::TEXTURE_BINDING | wgpu::TextureUsages::COPY_DST,
            view_formats: &[],
        });

        queue.write_texture(
            wgpu::TexelCopyTextureInfoBase {
                texture: &texture,
                mip_level: 0,
                origin: wgpu::Origin3d::ZERO,
                aspect: wgpu::TextureAspect::All,
            },
            data,
            wgpu::TexelCopyBufferLayout {
                offset: 0,
                bytes_per_row: Some(width * 4),
                rows_per_image: None,
            },
            wgpu::Extent3d {
                width,
                height,
                depth_or_array_layers: 1,
            },
        );

        let view = texture.create_view(&wgpu::TextureViewDescriptor::default());

        let bind_group = device.create_bind_group(&wgpu::BindGroupDescriptor {
            label: Some("Texture bind group"),
            layout: &self.texture_group_layout,
            entries: &[
                BindGroupEntry {
                    binding: 0,
                    resource: wgpu::BindingResource::TextureView(&view),
                },
                BindGroupEntry {
                    binding: 1,
                    resource: wgpu::BindingResource::Sampler(&self.texture_sampler),
                },
            ],
        });

        let id = self.textures.len();
        self.textures.push(bind_group);

        TextureId(id)
    }
}
