
/**
 * used to numerize pages
 */
class Paginator{
    /**
     *
     * @param {base url with no parameters} url 
     * @param {total pages available} totalPages 
     * @param {requested current page, default 1} currentPage 
     * @param {how many items per page, sent in the url as parameter, default 10} limit
     */
    constructor(url, totalPages, currentPage, limit){
        this.totalPages = totalPages;
        this.currentPage = currentPage || 1;
        this.limit = limit || 10;
        //this.url:(page)=>`/post?page=${page}&limit=${itemsPerPage}`;
        this.url = url;
    }



    /**
     * Generate a url link to the desired page with the base url parameter 
     * and the limit items parameter of this obj.
     * example:
     * url = users/memberslist, limit = 5
     * geturl(3) returns users/memberslist?page=3&limit=5
     * @param {page number to link for} page 
     */
    geturl(page){
        if(page>this.totalPages){
            return `${this.url}?page=${this.totalpages}&limit=${this.itemsPerPage}`;
        }
        return `${this.url}?page=${page}&limit=${this.limit}`;
    }

}

module.exports = Paginator;