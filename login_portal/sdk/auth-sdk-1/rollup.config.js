import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import peerDepsExternal from 'rollup-plugin-peer-deps-external';
import postcss from 'rollup-plugin-postcss';

export default {
    input: 'src/index.ts',
    output: [
        {
            file: 'dist/index.js',
            format: 'cjs',
            sourcemap: true,
            exports: 'named',
        },
        {
            file: 'dist/index.esm.js',
            format: 'esm',
            sourcemap: true,
            exports: 'named',
        },
    ],
    plugins: [
        peerDepsExternal(),
        resolve({
            extensions: ['.ts', '.tsx', '.js', '.jsx'],
        }),
        commonjs(),
        typescript({
            tsconfig: './tsconfig.json',
            declaration: true,
            declarationDir: './dist',
            exclude: ['**/*.test.ts', '**/*.test.tsx'],
        }),
        postcss({
            extract: 'styles.css',
            minimize: true,
        }),
    ],
    external: ['react', 'react-dom'],
};
