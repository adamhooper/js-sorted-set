import { terser } from 'rollup-plugin-terser';

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
};
