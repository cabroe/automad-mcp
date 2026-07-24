<# Shared page layout #>
<!DOCTYPE html>
<html lang="@{ :lang | def('de') }">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>@{ title | def('My Theme') }</title>
    <link rel="stylesheet" href="/packages/@{ theme }/dist/main.css">
</head>
<body>
    <@~ snippet main ~@>
    <@~ end ~@>

    <@ main @>
</body>
</html>
