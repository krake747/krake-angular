# KrakeAngular

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 17.3.6.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via a platform of your choice. To use this command, you need to first add a package that implements end-to-end testing capabilities.

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.io/cli) page.

## Setup krake-angular

```bash
ng new krake-angular --create-application false --prefix krake
ng g application krake-app --defaults --prefix krake --style=css --routing=true --inline-template --inline-style --skip-tests
```

### Update NPM scripts

```bash
npm install -D prettier
```

### Build tools

```bash
npm install -D esbuild-visualizer source-map-explorer http-server
```

### Dependency graph analysis

```bash
sudo apt-get install graphviz
npm install -D madge npm-run-all
```

### Eslint

```bash
ng lint
```

### Deploy to GitHub Pages

```bash
ng add angular-cli-ghpages
ng deploy --base-href=/krake-angular/
```
