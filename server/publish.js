Books = new Meteor.Collection("books");
Notes = new Meteor.Collection("notes");

Meteor.publish('books', function() {
  return Books.find({});
});

Meteor.publish('notes', function(book_id) {
  return Notes.find({book_id: book_id});
});