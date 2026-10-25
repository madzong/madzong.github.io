use std::sync::Arc;

use web_time::Instant;
use winit::application::ApplicationHandler;
use winit::dpi::PhysicalSize;
use winit::event::WindowEvent;
use winit::event_loop::{ActiveEventLoop, EventLoop, EventLoopProxy};
use winit::window::{Window, WindowId};

use crate::desktop::Desktop;
use crate::gpu::Gpu;
use crate::utils::Image;

mod desktop;
mod gpu;
mod renderer;
mod utils;
mod taskbar;
mod colors;

enum UserEvent {
    GPUReady(Gpu),
    ImageLoaded(String, Image),
}

struct App {
    proxy: EventLoopProxy<UserEvent>,
    gpu: Option<Gpu>,
    start: Instant,
    desktop: Option<Desktop>,
}

impl ApplicationHandler<UserEvent> for App {
    fn resumed(&mut self, event_loop: &ActiveEventLoop) {
        if self.gpu.is_some() {
            return;
        }

        #[allow(unused_mut)]
        let mut attributes = Window::default_attributes().with_title("wgpu");
        #[cfg(target_arch = "wasm32")]
        {
            use wasm_bindgen::JsCast;
            use winit::platform::web::WindowAttributesExtWebSys;
            let canvas = web_sys::window()
                .and_then(|w| w.document())
                .and_then(|d| d.get_element_by_id("canvas"))
                .and_then(|e| e.dyn_into::<web_sys::HtmlCanvasElement>().ok())
                .expect("index.html needs a <canvas id=\"canvas\">");
            attributes = attributes.with_canvas(Some(canvas));
        }
        let window = Arc::new(event_loop.create_window(attributes).unwrap());

        if self.desktop.is_none() {
            let screen = window.inner_size();
            self.desktop = Some(Desktop::new([screen.width, screen.height]));
        }

        // Hand the finished Gpu back to the event loop as a user event.
        let proxy = self.proxy.clone();
        let display = event_loop.owned_display_handle();
        let init = async move {
            let _ = proxy.send_event(UserEvent::GPUReady(Gpu::new(window, display).await));
        };
        #[cfg(target_arch = "wasm32")]
        wasm_bindgen_futures::spawn_local(init);
        #[cfg(not(target_arch = "wasm32"))]
        pollster::block_on(init);
    }

    fn user_event(&mut self, _event_loop: &ActiveEventLoop, event: UserEvent) {
        match event {
            UserEvent::GPUReady(gpu) => {
                // The canvas may have been resized while the device was being created.
                let mut gpu = gpu;
                let size = gpu.window.inner_size();
                gpu.resize(size.width, size.height);
                self.desktop
                    .as_mut()
                    .unwrap()
                    .resize(size.width, size.height);
                gpu.window.request_redraw();
                self.gpu = Some(gpu);

                let proxy = self.proxy.clone();
                let loader = async move {
                    let img = if let Some(img) = utils::load_image("assets/wallpaper.png").await {
                        img
                    } else {
                        log::error!("Failed to load wallpaper");
                        return;
                    };

                    let _ = proxy.send_event(
                        UserEvent::ImageLoaded(
                            "wallpaper".to_string(),
                            img
                        )
                    );
                };
                #[cfg(target_arch = "wasm32")]
                wasm_bindgen_futures::spawn_local(loader);
                #[cfg(not(target_arch = "wasm32"))]
                pollster::block_on(loader);
            }
            UserEvent::ImageLoaded(name, image) => {
                if name == "wallpaper" {
                    if let Some(gpu) = &mut self.gpu {
                        let tex_id = gpu.add_texture(&image);
                        let desktop = self.desktop.as_mut().expect("Desktop should be initialized");
                        desktop.set_wallpaper(desktop::Wallpaper::Image(tex_id));
                    } else {
                        log::error!("Tried loading an image when GPU wasn't initialized");
                        return;
                    }
                }
            }
        }
    }

    fn window_event(&mut self, event_loop: &ActiveEventLoop, _id: WindowId, event: WindowEvent) {
        let Some(gpu) = &mut self.gpu else { return };
        match event {
            WindowEvent::CloseRequested => event_loop.exit(),
            WindowEvent::Resized(size) => self.resize(size),
            WindowEvent::RedrawRequested => {
                gpu.render(
                    self.start.elapsed().as_secs_f32(),
                    self.desktop.as_ref().unwrap().gen_draw_calls(),
                );
                gpu.window.request_redraw();
            }
            _ => {}
        }
    }
}

impl App {
    fn resize(&mut self, size: PhysicalSize<u32>) {
        if let Some(gpu) = &mut self.gpu
            && let Some(desktop) = &mut self.desktop
        {
            gpu.resize(size.width, size.height);
            desktop.resize(size.width, size.height);
        }
    }
}

fn main() {
    #[cfg(target_arch = "wasm32")]
    {
        console_error_panic_hook::set_once();
        console_log::init_with_level(log::Level::Info).unwrap();
    }
    #[cfg(not(target_arch = "wasm32"))]
    env_logger::init();

    let event_loop = EventLoop::<UserEvent>::with_user_event().build().unwrap();
    let app = App {
        proxy: event_loop.create_proxy(),
        gpu: None,
        start: Instant::now(),
        desktop: None,
    };

    #[cfg(target_arch = "wasm32")]
    {
        use winit::platform::web::EventLoopExtWebSys;
        event_loop.spawn_app(app);
    }
    #[cfg(not(target_arch = "wasm32"))]
    {
        let mut app = app;
        event_loop.run_app(&mut app).unwrap();
    }
}
