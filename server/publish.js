Books = new Meteor.Collection("books");
Notes = new Meteor.Collection("notes");

Meteor.publish('books', function() {
  return Books.find({});
});

Meteor.publish('notes', function(book_id) {
  return Notes.find({book_id: book_id});
});

Accounts.validateNewUser(function (user) {
  throw new Meteor.Error(403, "Signup not allowed.");
});