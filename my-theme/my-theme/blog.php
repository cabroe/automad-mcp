<#

    Blog overview template.

#>
<@ components/page.php @>

<@~ snippet main ~@>
<main class="blog">
    <h1>@{ title | def('Blog') }</h1>
    <div class="posts">
        <@ newPagelist { type: 'children', sort: 'date desc' } @>
        <@ foreach @pagelist as $page @>
        <article class="post-preview">
            <h2><a href="$page->get('url')">$page->get('title')</a></h2>
            <time>$page->get('date | dateFormat ("d. F Y")')</time>
            <p>$page->get('+main | shorten (200)')</p>
        </article>
        <@ end @>
    </div>
</main>
<@~ end ~@>
