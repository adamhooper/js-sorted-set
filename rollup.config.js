import { terser } from 'rollup-plugin-terser';
import babel from 'rollup-plugin-babel';

export default {
  input: 'src/SortedSet.js',
  output: [
    {
      name: 'sorted-set',
      file: 'sorted-set.js',
      format: 'umd',
      sourcemap: true,
    },
    {
      name: 'sorted-set',
      file: 'sorted-set.min.js',
      format: 'umd',
      sourcemap: true,
      plugins: [terser()],
    },
  ],
  plugins: [
    babel({
      exclude: 'node_modules/**',
      presets: [
        ["@babel/env", {"modules": false, "targets": ">1%, not dead, not IE 11"}]
      ],
    })
  ],
  strictDeprecations: true
};
