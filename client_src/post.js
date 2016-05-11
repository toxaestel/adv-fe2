(function ($) {
    $(document).ready(function () {

        Handlebars.registerHelper('JSON', function() {
            var string = JSON.stringify(this.posts, null, '\t');
            
            return new Handlebars.SafeString(string);
        });

        Handlebars.registerHelper('striped', function (items, opts) {
            var result = '<table class="striped">';
            $(this.posts).each(function (ignore, el) {
                result += '<tr><td>' + opts.fn(el) + '</td></tr>';
            });
            result += '</table>';
            return result;
        });

        function render() {
            var posts = {
              'posts': Data.getPosts()
            };
            renderTemplate('JSONPosts', 'template-JSON-posts', posts);
            renderTemplate('stripedPosts', 'template-striped-posts', posts);
        }

        function compileTemplate(dataObj, templateId) {
            var compiler = Handlebars.compile($('#'+templateId).html());

            return compiler(dataObj);
        }

        function renderTemplate(elId, templateId, data) {
            $('#'+elId).append(compileTemplate(data, templateId));
        }

        render();
    });
})(jQuery);
