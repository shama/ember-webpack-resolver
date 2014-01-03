QUnit.module('resolve');

test('resolve a route and template', function() {
  visit('/bear');
  click('.bear');
  andThen(function() {
    equal(find('.bear').text(), 'IM A BEAR, RAWR');
  });
});

