
# NEXUS POWER-SERVER v10.8
# Versión final de alta compatibilidad en puerto 9999

$p = 9999
$l = New-Object System.Net.HttpListener
$l.Prefixes.Add("http://localhost:$p/")
try {
    $l.Start()
    Write-Host "`n>>> NEXUS MODULAR CONECTADO EN http://localhost:$p <<<" -ForegroundColor Cyan
    Write-Host "Manten esta ventana abierta para usar el sistema modular." -ForegroundColor White
    
    while ($l.IsListening) {
        $c = $l.GetContext()
        $req = $c.Request
        $res = $c.Response
        $path = $req.Url.LocalPath.TrimStart('/')
        if ($path -eq "" -or $path -eq "/") { $path = "index.html" }
        $fullPath = Join-Path (Get-Location) $path
        
        if (Test-Path $fullPath) {
            $bytes = [System.IO.File]::ReadAllBytes($fullPath)
            $res.ContentLength64 = $bytes.Length
            $ext = [System.IO.Path]::GetExtension($fullPath).ToLower()
            $res.ContentType = switch ($ext) {
                ".html" { "text/html" }
                ".js" { "application/javascript" }
                ".css" { "text/css" }
                default { "application/octet-stream" }
            }
            $res.OutputStream.Write($bytes, 0, $bytes.Length)
        } else {
            $res.StatusCode = 404
        }
        $res.Close()
    }
} catch {
    Write-Host "Error Fatal al arrancar en http://localhost:$p" -ForegroundColor Red
} finally {
    $l.Stop()
}
