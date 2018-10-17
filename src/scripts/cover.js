/**
 * The introduction module
 * Constructor function.
 */
class Cover extends H5P.EventDispatcher {
  constructor(config, title, contentId, contentData, parent) {
    super();

    this.parent = parent;

    this.imageDiv = document.createElement('div');
    this.image = this.parseImage(config.coverImage, contentId);
    this.title = title;
    this.description = config.coverDescription;
    this.author = 'temp';
    this.imageDiv.appendChild(this.image);
  } 

  parseImage(options, id) {
    const img = document.createElement('img');
    img.classList.add('h5p-digibook-cover-image');
    img.src = options.path;
    img.setAttribute('draggable', 'false');
    // img.setAttribute('alt', images[0].alt);
    // img.setAttribute('title', images[0].title);
    img.setAttribute('aria-live', 'polite');
    img.setAttribute('tabindex', 0);
    return img;
  }

  parseDescription() {

  }
}

export default Cover;