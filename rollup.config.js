import resolve from 'rollup-plugin-node-resolve';
import commonJs from 'rollup-plugin-commonjs';
import postCss from 'rollup-plugin-postcss';
import postCssSimpleVars from 'postcss-simple-vars';
import postCssNested from 'postcss-nested';
import babel from 'rollup-plugin-babel';
import { name, homepage, version } from './package.json';

export default {
    input: 'src/index.js',
    output: [
        {
            format: 'umd',
            name: 'TimelinesChart',
            file: 'dist/timelines-chart.js',
            sourcemap: true
        }
    ],
    plugins: [
        resolve(),
        commonJs(),
        postCss({
            plugins: [
                postCssSimpleVars(),
                postCssNested()
            ]
        }),
        babel({
            presets: [
                ["es2015", { "modules": false }]
            ],
            plugins: [
                "external-helpers",
                "transform-object-rest-spread",
                "transform-class-properties"
            ],
            babelrc: false
        })
    ],
    banner: `// Version ${version} ${name} - ${homepage}`
};