#[derive(Clone, Copy, Debug)]
pub struct Color {
    pub r: f32,
    pub g: f32,
    pub b: f32,
    pub a: f32,
}

impl From<Color> for [f32; 4] {
    fn from(value: Color) -> Self {
        [value.r, value.g, value.b, value.a]
    }
}

impl From<Color> for [u8; 4] {
    fn from(value: Color) -> Self {
        [
            (value.r * 255.0) as u8,
            (value.g * 255.0) as u8,
            (value.b * 255.0) as u8,
            (value.a * 255.0) as u8,
        ]
    }
}

impl Color {
    pub const fn hex(rgb: u32) -> Self {
        Self::hex_rgba((rgb << 8) | 0xFF)
    }

    pub const fn hex_rgba(rgba: u32) -> Self {
        let [r, g, b, a] = rgba.to_be_bytes();

        Self {
            r: r as f32 / 255.0,
            g: g as f32 / 255.0,
            b: b as f32 / 255.0,
            a: a as f32 / 255.0,
        }
    }
}

pub const FACE: Color = Color::hex(0xC0C0C0);
pub const HIGHLIGHT: Color = Color::hex(0xFFFFFF);
pub const SHADOW: Color = Color::hex(0x808080);
pub const DARK_SHADOW: Color = Color::hex(0x000000);
pub const TEXT: Color = Color::hex(0x000000);
pub const DESKTOP: Color = Color::hex(0x008080);
