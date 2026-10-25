use crate::{colors, renderer::{DrawCommand, Quad, TextureId}};

pub struct Taskbar {

}

impl Taskbar {
    const HEIGHT: f32 = 28.0;
    
    pub fn draw(&self, screen: [f32; 2]) -> Vec<DrawCommand> {
        let mut commands = vec![];

        // background
        commands.push(
            DrawCommand {
                quad: Quad {
                    pos: [0.0, screen[1] - Self::HEIGHT],
                    size: [screen[0], Self::HEIGHT],
                    color: colors::FACE.into(),
                },
                texture_id: TextureId::WHITE,
            }
        );

        commands.push(
            DrawCommand {
                quad: Quad {
                    pos: [0.0, screen[1] - Self::HEIGHT + 1.0],
                    size: [screen[0], Self::HEIGHT + 1.0],
                    color: colors::HIGHLIGHT.into(),
                },
                texture_id: TextureId::WHITE,
            }
        );

        commands.push(
            DrawCommand {
                quad: Quad {
                    pos: [0.0, screen[1] - Self::HEIGHT + 2.0],
                    size: [screen[0], Self::HEIGHT + 2.0],
                    color: colors::FACE.into(),
                },
                texture_id: TextureId::WHITE,
            }
        );

        commands
    }
}
