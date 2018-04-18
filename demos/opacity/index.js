import Custom from './custom'

const scroll = new Custom({
  extends: true,
  section: document.querySelector('.vs-section'),
  opacity: document.querySelector('h1')
})

scroll.init()