# less-plugin-bower-resolve

> Import [Less](http://lesscss.org) files from [Bower](http://bower.io) packages

This plugin requires Less in version >= 2.0.0-b2.

## Install

```sh
$ npm install --save-dev less-plugin-bower-resolve
```

## Usage

Just add `--bower-resolve` when you use `lessc`. You can learn more about `lessc` [here](http://lesscss.org/#using-less-command-line-usage). Here is an example:

```sh
$ lessc --bower-resolve styles.less styles.css
```

If you `@import` a Less file now, it will try to resolve the file from your `bower_components/` directory first (or a custom directory, if you use `.bowerrc`) and fallback to the old behavior, if no Bower package can be found. If you explicitly  _not_ want to load a module from `bower_components/` you can use absolute or relative paths like `@import "./hello/world";`. If the Bower packages references multiple Less files in the `"main"` property of `bower.json` (or `.bower.json` or `component.json`) all of the will be imported.

Let's look at an example. If you have:

```less
@import "my-module";
```

And you have a `my-module/` inside `bower_components/` with a `bower.json` like this:

```json
{
  "main": [
    "src/hello.less",
    "src/world.less"
  ]
}
```

Than `src/hello.less` and `src/world.less` will be imported. Prior to that you would have to do that:

```less
// OLD WAY
@import "bower_components/my-module/src/hello.less";
@import "bower_components/my-module/src/world.less";
```

This was very error prone as you couldn't know if a Bower package author would rename the `src/`, `hello.less` or `world.less` or if he introduces new files, removes old ones or changes their order.

Anyway - if you really want you can target a specific file inside a Bower package like this:

```less
@import "my-module/src/hello.less";
```

This will at least stopping you from prepending `bower_components/` to your imports. If you distributed a Less file via Bower before and used other packages you know that it's bad to hard-code `bower_components/` this way, because you can't customize the directory via `.bowerrc` anymore.

## Testing

Run the tests with `$ npm test`.
