use crate::{
    colors,
    renderer::{DrawCommand, Quad, TextureId},
    taskbar::Taskbar,
};

pub enum Wallpaper {
    SingleColor([f32; 4]),
    Image(TextureId),
}

impl Default for Wallpaper {
    fn default() -> Self {
        Self::SingleColor(colors::DESKTOP.into())
    }
}

impl Wallpaper {
    fn draw(&self, size: [f32; 2]) -> DrawCommand {
        let pos = [0.0, 0.0];

        match self {
            Self::SingleColor(color) => DrawCommand {
                quad: Quad {
                    pos,
                    size,
                    color: *color,
                },
                texture_id: TextureId::WHITE,
            },
            Self::Image(image) => DrawCommand {
                quad: Quad {
                    pos,
                    size,
                    color: [1.0, 1.0, 1.0, 1.0],
                },
                texture_id: *image,
            },
        }
    }
}

pub struct Desktop {
    screen: [f32; 2],
    wallpaper: Wallpaper,
    taskbar: Taskbar,
}

impl Desktop {
    pub fn new(screen: [u32; 2]) -> Self {
        Desktop {
            screen: [screen[0] as f32, screen[1] as f32],
            wallpaper: Wallpaper::SingleColor(colors::DESKTOP.into()),
            taskbar: Taskbar {},
        }
    }

    pub fn gen_draw_calls(&self) -> Vec<DrawCommand> {
        let mut draws = vec![
            self.wallpaper.draw(self.screen),
        ];

        draws.append(&mut self.taskbar.draw(self.screen));

        draws
    }

    pub fn resize(&mut self, width: u32, height: u32) {
        self.screen[0] = width as f32;
        self.screen[1] = height as f32;
    }

    pub fn set_wallpaper(&mut self, wallpaper: Wallpaper) {
        self.wallpaper = wallpaper;
    }
}
