use std::sync::Arc;

use winit::{event_loop::OwnedDisplayHandle, window::Window};

use crate::{renderer::{DrawCommand, Renderer, TextureId}, utils::Image};

/// Everything that needs a GPU device. Created asynchronously, because
/// requesting an adapter/device can't block in the browser.
pub struct Gpu {
    pub window: Arc<Window>,
    surface: wgpu::Surface<'static>,
    device: wgpu::Device,
    queue: wgpu::Queue,
    config: wgpu::SurfaceConfiguration,
    renderer: Renderer,
}

impl Gpu {
    pub async fn new(window: Arc<Window>, display: OwnedDisplayHandle) -> Gpu {
        // In the browser this falls back to WebGL2 when no WebGPU adapter is available.
        let instance = wgpu::util::new_instance_with_webgpu_detection(
            wgpu::InstanceDescriptor::new_with_display_handle(Box::new(display)),
        )
        .await;
        let surface = instance
            .create_surface(window.clone())
            .expect("failed to create surface");
        let adapter = instance
            .request_adapter(&wgpu::RequestAdapterOptions {
                compatible_surface: Some(&surface),
                ..Default::default()
            })
            .await
            .expect("no suitable GPU adapter");
        log::info!("using {:?}", adapter.get_info().backend);
        let (device, queue) = adapter
            .request_device(&wgpu::DeviceDescriptor {
                // Ask only for what WebGL2 can provide, but keep the adapter's
                // real maximum texture size so large/HiDPI canvases still work.
                required_limits: wgpu::Limits::downlevel_webgl2_defaults()
                    .using_resolution(adapter.limits()),
                ..Default::default()
            })
            .await
            .expect("failed to create device");

        let size = window.inner_size();
        let caps = surface.get_capabilities(&adapter);
        let format = caps
            .formats
            .iter()
            .copied()
            .find(|f| !f.is_srgb())
            .unwrap_or(caps.formats[0]);

        let mut config = surface
            .get_default_config(&adapter, size.width.max(1), size.height.max(1))
            .expect("surface not supported by adapter");
        config.format = format;
        log::info!("Using format {format:?} (available: {:?})", caps.formats);
        surface.configure(&device, &config);

        let renderer = Renderer::new(&device, &queue, config.format);

        Gpu {
            window,
            surface,
            device,
            queue,
            config,
            renderer,
        }
    }

    pub fn resize(&mut self, width: u32, height: u32) {
        if width == 0 || height == 0 {
            return;
        }
        self.config.width = width;
        self.config.height = height;
        self.surface.configure(&self.device, &self.config);
    }

    pub fn render(&mut self, time: f32, draw_commands: Vec<DrawCommand>) {
        let frame = match self.surface.get_current_texture() {
            wgpu::CurrentSurfaceTexture::Success(frame) => frame,
            wgpu::CurrentSurfaceTexture::Suboptimal(frame) => {
                // Draw this one, reconfigure before the next.
                self.surface.configure(&self.device, &self.config);
                frame
            }
            wgpu::CurrentSurfaceTexture::Outdated | wgpu::CurrentSurfaceTexture::Lost => {
                self.surface.configure(&self.device, &self.config);
                return;
            }
            other => {
                log::warn!("skipping frame: {other:?}");
                return;
            }
        };
        let view = frame.texture.create_view(&Default::default());

        let mut encoder = self.device.create_command_encoder(&Default::default());
        self.renderer.draw(
            &self.device,
            &self.queue,
            &mut encoder,
            &view,
            [self.config.width as f32, self.config.height as f32],
            &draw_commands,
        );
        
        self.queue.submit([encoder.finish()]);

        self.window.pre_present_notify();
        self.queue.present(frame);
    }

    pub fn add_texture(&mut self, image: &Image) -> TextureId {
        self.renderer.add_texture(&self.device, &self.queue, image.width, image.height, &image.rgba)
    }
}

