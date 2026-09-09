use tauri::menu::{Menu, MenuItem, PredefinedMenuItem};
use tauri::tray::TrayIconBuilder;
use tauri::{Emitter, LogicalPosition, Manager, WebviewWindow};
use tauri_plugin_global_shortcut::{Code, GlobalShortcutExt, Modifiers, Shortcut, ShortcutState};

const WINDOW_WIDTH: f64 = 220.0;
const TOP_MARGIN: f64 = 0.0;

#[tauri::command]
fn set_perch_x(window: WebviewWindow, x: f64) {
    let _ = window.set_position(tauri::Position::Logical(LogicalPosition {
        x,
        y: TOP_MARGIN,
    }));
}

#[tauri::command]
fn get_window_x(window: WebviewWindow) -> f64 {
    let scale = window.scale_factor().unwrap_or(1.0);
    window
        .outer_position()
        .map(|p| p.x as f64 / scale)
        .unwrap_or(0.0)
}

#[tauri::command]
fn get_screen_width(window: WebviewWindow) -> f64 {
    if let Ok(Some(monitor)) = window.current_monitor() {
        let scale = monitor.scale_factor();
        return monitor.size().width as f64 / scale;
    }
    1280.0
}

fn toggle_charm(window: &WebviewWindow) {
    if window.is_visible().unwrap_or(false) {
        let _ = window.hide();
    } else {
        let _ = window.show();
        let _ = window.set_focus();
    }
}

fn center_top(window: &WebviewWindow) {
    if let Ok(Some(monitor)) = window.current_monitor() {
        let scale = monitor.scale_factor();
        let screen_w = monitor.size().width as f64 / scale;
        let x = (screen_w - WINDOW_WIDTH) / 2.0;
        let _ = window.set_position(tauri::Position::Logical(LogicalPosition { x, y: TOP_MARGIN }));
        let _ = window.emit("perch-moved", x);
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(
            tauri_plugin_global_shortcut::Builder::new()
                .with_handler(|app, _shortcut, event| {
                    if event.state == ShortcutState::Pressed {
                        if let Some(window) = app.get_webview_window("main") {
                            toggle_charm(&window);
                        }
                    }
                })
                .build(),
        )
        .invoke_handler(tauri::generate_handler![set_perch_x, get_screen_width, get_window_x])
        .setup(|app| {
            let window = app.get_webview_window("main").expect("main window must exist");
            center_top(&window);
            let _ = window.show();

            let shortcut = Shortcut::new(Some(Modifiers::SHIFT | Modifiers::ALT), Code::KeyK);
            app.global_shortcut().register(shortcut)?;

            let show_hide = MenuItem::with_id(app, "toggle", "Show/Hide Charm", true, None::<&str>)?;
            let recenter = MenuItem::with_id(app, "recenter", "Move to Top Center", true, None::<&str>)?;
            let separator = PredefinedMenuItem::separator(app)?;
            let quit = MenuItem::with_id(app, "quit", "Quit", true, None::<&str>)?;
            let menu = Menu::with_items(app, &[&show_hide, &recenter, &separator, &quit])?;

            let _tray = TrayIconBuilder::new()
                .icon(app.default_window_icon().unwrap().clone())
                .menu(&menu)
                .tooltip("DeskCharm — Shift+Alt+K to show/hide")
                .on_menu_event(|app, event| match event.id.as_ref() {
                    "toggle" => {
                        if let Some(window) = app.get_webview_window("main") {
                            toggle_charm(&window);
                        }
                    }
                    "recenter" => {
                        if let Some(window) = app.get_webview_window("main") {
                            center_top(&window);
                            let _ = window.show();
                        }
                    }
                    "quit" => {
                        app.exit(0);
                    }
                    _ => {}
                })
                .build(app)?;

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
