/**
 * just and ordinary page object to keep the routes cleaner
 * name - the page to add to layout
 * title - well.. the page title?
 * errors - if there is any extra errors, can be added here
 */

class Page {
    constructor(name,title,errors){
        this.name = name;
        this.title = title;
        this.errors = errors;
    }
}
module.exports = Page;