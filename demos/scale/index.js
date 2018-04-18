import Custom from './custom'

const image = document.querySelector('img');
const scroll = new Custom({
  extends: true,
  img: image
})

scroll.init()