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
    this.content = document.createElement('div');
    this.div.classList.add('h5p-digibook-navigation');
    
    this.titleElem = this.addMainTitle(config.title);
    this.chapters = this.findAllChapters(parent.instances, config.chapters);
    this.chapterElems = this.getChapterElements();


    //Appending phase
    this.div.appendChild(this.titleElem.div);

    this.chapterElems.forEach(element => {
      this.content.appendChild(element);
    });
    
    this.div.appendChild(this.content);


  }

  addMainTitle(title) {
    const div = document.createElement('div');
    const p = document.createElement('p');

    div.classList.add('h5p-digibook-navigation-maintitle');

    p.innerHTML = title;
    div.appendChild(p);
    return {
      div,
      p
    };
  }


  findSectionsInChapter(chapter, config) {
    const tmp = [];
    for (let j = 0; j < chapter.childInstances.length; j++) {
      const section = chapter.childInstances[j];
      section.title = this.parseLibrary(config[j].content);
      tmp.push(section);
    }
    return tmp;
  }

  findAllChapters(instances, config) {
    const chapters = [];
    for (let i = 0; i < instances.length; i++) {
      const sections = this.findSectionsInChapter(instances[i], config[i].chapter.params.content);
      const chapterTitle = config[i].chapter_title;
      chapters.push({
        sections,
        title:chapterTitle
      });
    }
    return chapters;
  }


  editChapterStatus(element, closing) {
    if (closing) {
      element.classList.add('h5p-digibook-navigation-closed');
      const arrow = element.getElementsByClassName('icon-expanded')[0];
      if (arrow) {
        arrow.classList.remove('icon-expanded');
        arrow.classList.add('icon-collapsed');
      }
      
    }
    else {
      element.classList.remove('h5p-digibook-navigation-closed');
      const arrow = element.getElementsByClassName('icon-collapsed')[0];
      if (arrow) {
        arrow.classList.remove('icon-collapsed');
        arrow.classList.add('icon-expanded');
      }
    }
  }
  

  //Fires whenever a redirect is happening in parent
  redirectHandler(newChapter) {
    this.chapterElems.filter(x => 
      this.chapterElems.indexOf(x) != newChapter).forEach(x => this.editChapterStatus(x, true));


    const targetElem = this.chapterElems[newChapter];
    this.editChapterStatus(targetElem, false);
  }



  toggleChapter(element) {
    const x = element.currentTarget.parentElement;
    const bool = !(x.classList.contains('h5p-digibook-navigation-closed'));
    this.editChapterStatus(x, bool);
  }

  isH5PTask(H5PObject) {

    if (typeof H5PObject.getMaxScore === 'function') {
      return H5PObject.getMaxScore() > 0;
    }
    return false;
  }

  createElemFromChapter(chapter, chapterIndex) {
    const that = this;

    //Initialize elements
    const chapterDiv = document.createElement('div');
    const sectionsDiv = document.createElement('div');
    const titleDiv = document.createElement('div');
    const title = document.createElement('p');

    //Add classes
    titleDiv.classList.add('h5p-digibook-navigation-chapter-title');
    chapterDiv.classList.add('h5p-digibook-navigation-chapter', 'h5p-digibook-navigation-closed');
    sectionsDiv.classList.add('h5p-digibook-navigation-sectionlist');

    
    title.innerHTML = chapter.title;
    title.setAttribute("title", chapter.title);

    const arrowIcon = document.createElement('span');
    const circleIcon = document.createElement('span');

    arrowIcon.classList.add('icon-collapsed');
    circleIcon.classList.add('icon-chapter-blank');



    titleDiv.appendChild(arrowIcon);
    titleDiv.appendChild(title);
    titleDiv.appendChild(circleIcon);

    chapterDiv.appendChild(titleDiv);

    titleDiv.onclick = (event) => {
      this.toggleChapter(event);
    };

    // Add sections to the chapter
    const sections = this.parent.instances[chapterIndex].childInstances;
    for (let i = 0; i < sections.length; i++) {
      const section = sections[i];
      
      const singleSection = document.createElement('div');
      const a = document.createElement('a');
      const icon = document.createElement('span');
      singleSection.classList.add('h5p-digibook-navigation-section');
      a.innerHTML = section.title;

      icon.classList.add('h5p-digibook-navigation-section-taskicon');
      
      if (this.isH5PTask(section)) {
        icon.classList.add('icon-chapter-blank');
      }
      singleSection.appendChild(icon);
      
      singleSection.appendChild(a);
      
      sectionsDiv.appendChild(singleSection);
      
      a.onclick = () => {
        that.parent.trigger('newChapter', {
          h5pbookid: that.parent.contentId,
          chapter: chapterIndex,
          section: i
        });
      };
    }
    chapterDiv.appendChild(sectionsDiv);

    
    return {
      chapterDiv,
      sectionsDiv,
      sections
    };
  }

  getChapterElements() {
    let tmp = [];
    for (let i = 0; i < this.chapters.length; i++) {
      const chapter = this.chapters[i];      
      const elem = this.createElemFromChapter(chapter, i);
      tmp.push(elem.chapterDiv);
    }
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
}
export default SideBar;