struct Quad {
    @location(0) pos: vec2<f32>,
    @location(1) size: vec2<f32>,
    @location(2) color: vec4<f32>,
}

struct VertexOut {
    @builtin(position) clip: vec4<f32>,
    @location(0) color: vec4<f32>,
    @location(1) uv: vec2<f32>,
}

struct Screen {
    size: vec2<f32>,
    _pad: vec2<f32>,
};

@group(0) @binding(0) var<uniform> screen: Screen;

@group(1) @binding(0) var texture: texture_2d<f32>;
@group(1) @binding(1) var tex_sampler: sampler;

@vertex
fn vs_main(@builtin(vertex_index) i: u32, quad: Quad) -> VertexOut {
    var corners = array<vec2<f32>, 6>(
        vec2(0.0, 0.0), vec2(1.0, 0.0), vec2(0.0, 1.0),
        vec2(0.0, 1.0), vec2(1.0, 0.0), vec2(1.0, 1.0),
    );
    let p = quad.pos + corners[i] * quad.size;
    let n = p / screen.size;
    let clip = vec2(n.x * 2.0 - 1.0, 1.0 - n.y * 2.0);

    var out: VertexOut;
    out.clip = vec4(clip, 0.0, 1.0);
    out.color = quad.color;
    out.uv = corners[i];
    return out;
}

@fragment
fn fs_main(v_out: VertexOut) -> @location(0) vec4<f32> {
    return textureSample(texture, tex_sampler, v_out.uv) * v_out.color;
}
