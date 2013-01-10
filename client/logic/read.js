Books = new Meteor.Collection("books");
Notes = new Meteor.Collection("notes");
SearchResults = new Meteor.Collection(null);

Session.set('page_style', 'list');
Session.set('book_status', null);
Session.set('book_id', null);
Session.set('more_url', null);

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

var debug;

Template.overview.events({
  'click a.do': function(event) {
    debug = event;
    Session.set('book_status', 'do');
  },
  'click a.wish': function(event) {
    Session.set('book_status', 'wish');
  },
  'click a.collect': function(event) {
    Session.set('book_status', 'collect');
  }
});

/* page_style: list */

Template.showBooks.books = function() {
  if (Session.get('page_style') === 'list') {
    if (Session.get('book_status')) {
      return Books.find({'status': Session.get('book_status')});
    }
    return Books.find({});
  }
  if (Session.get('page_style') === 'search') {
    return SearchResults.find({});
  }
};

Template.showBooks.more_url = function() {
  if (Session.get('page_style') === 'search') {
    return Session.get('more_url');
  }
  return null;
};

Template.showBooks.events({
  'click a.load_more': function(event) {
    searchDouban();
  }
});

/* Handle Search */

var searchDouban = function(keyword) {
  var url = Session.get('more_url');
  if (keyword) {
    url = 'https://api.douban.com/v2/book/search?count=20&apikey=0a16b1881f205f621e4414985d611e26&q='+String(keyword)
  }
  $.ajax({
    dataType: 'jsonp',
    url: url,
    success: function(result) {
      if (keyword) {
        SearchResults.remove({});
      }
      for (var k=0; k<20; k++) {
        SearchResults.insert(result.books[k]);
      };
      Session.set('more_url', 'https://api.douban.com/v2/book/search?count=20&apikey=0a16b1881f205f621e4414985d611e26&q='+String(keyword)+'&start='+String(Number(result.count)+Number(result.start)));
      Session.set('book_id', null);
      Session.set('page_style', 'search');
    }
  });
}

Template.search.events({
  'keyup input.search_content': function(event) {
    if (event.type === "keyup" && event.which === 13) {
      searchDouban(event.target.value)    
    }
  }
});

Template.control.events({
  'click button': function(event) {
    var book = SearchResults.findOne({'_id': String(event.target.attributes.item_id.value)});
    var status = String(event.target.attributes.to_status.value);
    book.status = status;
    delete book._id;
    var id = Books.insert(book);
  }
});

/* Notes */

Template.notes.showNotes = function() {
  return Session.get('book_id');
};

Template.notes.allNotes = function() {
  return Notes.find({});
};
