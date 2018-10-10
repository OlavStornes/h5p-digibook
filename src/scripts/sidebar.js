/**
 * A component which helps in navigation
 * Constructor function.
 */
class SideBar extends H5P.EventDispatcher {
  constructor(config, contentId, parent) {
    super();
    this.id = contentId;
    this.parent = parent;
    this.div = document.createElement('div');
    this.div.classList.add('h5p-digibook-navigation');

    this.chapters = [];


    this.titleElem = this.addMainTitle(config.title);
    this.findAllChapters(config);

    this.chapterElems = this.getChapterElements();



    //Appending phase
    this.div.appendChild(this.titleElem.div);

    this.chapterElems.forEach(element => {
      this.div.appendChild(element);
    });



  }

  addMainTitle(title) {
    const div = document.createElement('div');
    const p = document.createElement('p');

    p.innerHTML = title;
    div.appendChild(p);
    return {
      div,
      p
    };
  }

  findAllChapters(config) {
    for (let i = 0; i < config.chapters.length; i++) {
      this.chapters.push(config.chapters[i]);
    }
  }

  toggleChapterShow(element) {

    const x = element.target.nextSibling;
    if (x.style.display === "none") {
      x.style.display = "grid";
    } 
    else {
      x.style.display = "none";
    }
  }

  createElemFromChapter(chapter) {
    const chapterDiv = document.createElement('div');
    const sectionsDiv = document.createElement('div');
    const title = document.createElement('p');
    title.classList.add('h5p-digibook-navigation-chapter-title');
    chapterDiv.classList.add('h5p-digibook-navigation-chapter');
    sectionsDiv.classList.add('h5p-digibook-navigation-sections');

    title.innerHTML = chapter.chapter_title;

    chapterDiv.appendChild(title);

    const sections = chapter.chapter.params.content;
    sections.forEach(section => {
      const p = document.createElement('button');
      p.innerHTML = this.parseLibrary(section.content);

      sectionsDiv.appendChild(p);
      title.onclick = (event) => {
        this.toggleChapterShow(event);
      };
      p.onclick = (event) => {
        console.log("This should redirect");
      };
    });
    chapterDiv.appendChild(sectionsDiv);


    return {
      chapterDiv,
      sectionsDiv,
      sections
    };
  }

  getChapterElements() {
    let tmp = [];
    this.chapters.forEach(chapter => {
      const elem = this.createElemFromChapter(chapter);
      tmp.push(elem.chapterDiv);
    });
    return tmp;
  }


  /**
   * Parses the library which is used
   * TODO: Implement a more flexible system for library/title detection
   * @param {string} input 
   */
  parseLibrary(input) {
    let tmp;

    switch (input.library.split(" ")[0]) {

      case "H5P.AdvancedText":
        // Finds the first H2-element inside a text-document
        tmp = input.params.text.match(/<h2>(.+)<\/h2>/);
        if (tmp)
          tmp = tmp[1];
        else
          tmp = "Unnamed paragraph";
        break;

      case "H5P.Image":
        tmp = input.params.alt;
        break;
      default:
        tmp = input.library;
        break;
    }
    return tmp;
  }

  /**
   * Parse an object of chapters to create the navigation bar
   * @param {object} config 
   */
  parseChapters(config, parent) {
    const that = this;
    const divElem = document.createElement('div');
    divElem.classList.add('h5p-digibook-navigation');

    const mainTitle = document.createElement('p');
    mainTitle.innerHTML = config.title;
    mainTitle.classList.add('h5p-digibook-navigation-title');

    divElem.appendChild(mainTitle);

    for (let i = 0; i < config.chapters.length; i++) {
      const chapter = config.chapters[i];
      const ulElem = document.createElement('ul');
      const title = document.createElement('p');
      const chapterDiv = document.createElement('div');

      //Each chapter has their own title
      title.innerHTML = chapter.chapter_title;

      chapterDiv.appendChild(title);

      //Traverse all sections inside a chapter
      for (let j = 0; j < chapter.chapter.params.content.length; j++) {
        const section = chapter.chapter.params.content[j];
        const liElem = document.createElement('li');
        const aElem = document.createElement('a');

        aElem.innerHTML = this.parseLibrary(section.content);
        aElem.parent = parent;

        aElem.onclick = function () {
          // Send a trigger upstream
          that.parent.trigger('newChapter', {
            h5pbookid: that.parent.contentId,
            chapter: i,
            section: j
          });
        };
        liElem.appendChild(aElem);
        ulElem.appendChild(liElem);

      }
      chapterDiv.appendChild(ulElem);
      divElem.appendChild(chapterDiv);
    }

    return divElem;
  }
}
export default SideBar;