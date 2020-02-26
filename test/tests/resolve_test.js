QUnit.module('resolve')

test('resolve a route and template', function() {
  visit('/bear')
  click('.bear')
  andThen(function() {
    equal($.trim(find('.bear').text()), 'ON')
  })
})

