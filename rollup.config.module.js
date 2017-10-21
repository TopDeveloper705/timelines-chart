import postCss from 'rollup-plugin-postcss';
import postCssSimpleVars from 'postcss-simple-vars';
import postCssNested from 'postcss-nested';
import babel from 'rollup-plugin-babel';
import { dependencies } from './package.json';

export default {
    input: 'src/index.js',
    output: [
        {
            format: 'cjs',
            file: 'dist/timelines-chart.common.js'
        },
        {
            format: 'es',
            file: 'dist/timelines-chart.mjs'
        }
    ],
    external: Object.keys(dependencies),
    plugins: [
        postCss({
            plugins: [
                postCssSimpleVars(),
                postCssNested()
            ]
        }),
        babel()
    ]
};