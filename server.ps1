$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add('http://127.0.0.1:8931/')
try { $listener.Start() } catch { Write-Output "START_FAIL:$($_.Exception.Message)"; exit 1 }
Write-Output 'LISTENING'
$mime = @{ '.html' = 'text/html;charset=utf-8'; '.css' = 'text/css'; '.js' = 'application/javascript'; '.png' = 'image/png'; '.jpg' = 'image/jpeg'; '.svg' = 'image/svg+xml' }
$base = 'e:\Work\prototype'
while ($listener.IsListening) {
    $ctx = $listener.GetContext()
    $req = $ctx.Request
    $res = $ctx.Response
    $url = if ($req.Url.LocalPath -eq '/') { '/b-workbench-ai.html' } else { $req.Url.LocalPath }
    $file = Join-Path $base $url.TrimStart('/')
    if (Test-Path $file) {
        $ext = [IO.Path]::GetExtension($file)
        $res.ContentType = if ($mime[$ext]) { $mime[$ext] } else { 'application/octet-stream' }
        $buf = [IO.File]::ReadAllBytes($file)
        $res.ContentLength64 = $buf.Length
        $res.OutputStream.Write($buf, 0, $buf.Length)
    } else { $res.StatusCode = 404 }
    $res.Close()
}