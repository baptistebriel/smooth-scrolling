import Custom from './custom'

const scroll = new Custom({
  extends: true,
  preload: true,
  noscrollbar: true,
  section: document.querySelector('.vs-section'),
  divs: document.querySelectorAll('.vs-div')
})

scroll.init()

// setTimeout(() => {
//     scroll.destroy()
// }, 1500)