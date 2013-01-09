Books = new Meteor.Collection("books");
Notes = new Meteor.Collection("notes");
SearchResults = new Meteor.Collection(null);

Session.set('page_style', 'list_books');
Session.set('book_status', null);
Session.set('book_id', null);

Meteor.subscribe('books');

Meteor.autosubscribe(function() {
  var book_id = Session.get('book_id');
  if (book_id) {
    Meteor.subscribe('notes', book_id);
  }
});

/* Header */

Template.overview.total = function() {
  return Books.find({}).count();
};

Template.overview.on_hold = function() {
  return Books.find({'status': 'on_hold'}).count();
};

Template.overview.do = function() {
  return Books.find({'status': 'do'}).count();
};

Template.overview.dropped = function() {
  return Books.find({'status': 'dropped'}).count();
};

Template.overview.wish = function() {
  return Books.find({'status': 'wish'}).count();
};

Template.overview.collect = function() {
  return Books.find({'status': 'collect'}).count();
};

/* page_style: home */

Template.showBooks.books = function() {
  if (Session.get('page_style') === 'list_books') {
    if (Session.get('book_status')) {
      return Books.find({'status': Session.get('book_status')});
    }
    return Books.find({});
  }
};

/* Handle Search */

Template.search.events({
  'keyup input.search_content': function(event) {
    if (event.type === "keyup" && event.which === 13) {
      $.ajax({
        dataType: 'jsonp',
        url: 'https://api.douban.com/v2/book/search?count=20&apikey=0a16b1881f205f621e4414985d611e26&q='+String(event.target.value),
        success: function(result) {
          SearchResults.remove({});
          for (var k=0; k<20; k++) {
            SearchResults.insert(result.books[k]);
          };
          Session.set('book_id', null);
          Session.set('page_style', 'search');
        }
      });
    }
  }
});

Template.results.books = function() {
  return SearchResults.find({});
};

Template.results.events({
  'click button': function(event) {
    var book = SearchResults.findOne({'_id': String(event.target.attributes.srid.value)});
    var status = String(event.target.attributes.class.value);
    book.status = status;
    delete book._id;
    var id = Books.insert(book);
    Session.set('book_id', id);
    Session.set('page_style', 'book');
  }
});

/* Notes */

Template.notes.showNotes = function() {
  return Session.get('book_id');
};

Template.notes.allNotes = function() {
  return Notes.find({});
};
