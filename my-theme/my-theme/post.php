<#

    Single blog post template.

#>
<@ components/page.php @>

<@~ snippet main ~@>
<main class="post">
    <article>
        <header>
            <h1>@{ title }</h1>
            <time>@{ date | dateFormat ("d. F Y") }</time>
        </header>
        <div class="content">
            @{ +main }
        </div>
    </article>
    <nav class="post-nav">
        <a href="@{ :urlParent }">← Back</a>
    </nav>
</main>
<@~ end ~@>
