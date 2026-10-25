{
  description = "Rust + wgpu project compiled to WebAssembly";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
    crane.url = "github:ipetkov/crane";
    rust-overlay = {
      url = "github:oxalica/rust-overlay";
      inputs.nixpkgs.follows = "nixpkgs";
    };
  };

  outputs =
    {
      self,
      nixpkgs,
      flake-utils,
      crane,
      rust-overlay,
    }:
    flake-utils.lib.eachDefaultSystem (
      system:
      let
        pkgs = import nixpkgs {
          inherit system;
          overlays = [ (import rust-overlay) ];
        };
        inherit (pkgs) lib;

        rustToolchainFor =
          p:
          p.rust-bin.stable.latest.default.override {
            targets = [ "wasm32-unknown-unknown" ];
            extensions = [
              "rust-src"
              "rust-analyzer"
            ];
          };
        craneLib = (crane.mkLib pkgs).overrideToolchain rustToolchainFor;

        # Must match the `wasm-bindgen` version pinned in Cargo.toml / Cargo.lock.
        wasm-bindgen-cli = pkgs.wasm-bindgen-cli_0_2_129;

        src = lib.fileset.toSource {
          root = ./.;
          fileset = lib.fileset.unions [
            (craneLib.fileset.commonCargoSources ./.)
            ./index.html
            ./Trunk.toml
            ./assets
            (lib.fileset.fileFilter (file: file.hasExt "wgsl") ./src)
          ];
        };

        commonArgs = {
          inherit src;
          strictDeps = true;
          # Otherwise cargo builds for the host instead of the browser.
          CARGO_BUILD_TARGET = "wasm32-unknown-unknown";
          doCheck = false; # wasm tests can't run in the build sandbox
        };

        # Dependencies are built in their own derivation so app changes don't rebuild wgpu.
        cargoArtifacts = craneLib.buildDepsOnly commonArgs;

        site = craneLib.buildTrunkPackage (
          commonArgs
          // {
            inherit cargoArtifacts wasm-bindgen-cli;
          }
        );
      in
      {
        packages.default = site;

        checks = {
          inherit site;
          clippy = craneLib.cargoClippy (
            commonArgs
            // {
              inherit cargoArtifacts;
              cargoClippyExtraArgs = "-- --deny warnings";
            }
          );
          fmt = craneLib.cargoFmt { inherit src; };
        };

        # `nix run` serves the release build on http://localhost:8080
        apps.default = flake-utils.lib.mkApp {
          drv = pkgs.writeShellScriptBin "serve" ''
            echo "Serving ${site} on http://localhost:8080"
            exec ${pkgs.python3Minimal}/bin/python3 -m http.server 8080 --directory ${site}
          '';
        };

        devShells.default = craneLib.devShell {
          packages = [
            pkgs.trunk # trunk serve -> http://localhost:8080
            wasm-bindgen-cli
            pkgs.binaryen
          ];

          # winit/wgpu dlopen these when running natively with `cargo run`.
          LD_LIBRARY_PATH = lib.makeLibraryPath (
            with pkgs;
            [
              vulkan-loader
              wayland
              libxkbcommon
              libx11
              libxcursor
              libxi
              libxrandr
            ]
          );
        };

        formatter = pkgs.nixfmt;
      }
    );
}
