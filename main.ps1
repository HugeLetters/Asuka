cd "C:\Users\ckuka\VS Code Projects\Asuka";
$arg0=$args[0];
if (!$arg0) {$arg0=""}
Switch ($arg0)
{
    "dev" {npx nodemon "./main.js"}
    "dev:inspect" {npx nodemon --inspect "./main.js"}
    Default {node "./main.js"}
};