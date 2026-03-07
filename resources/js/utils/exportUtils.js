const escapeCsvValue = (value) => {
    if (value === null || value === undefined) return '';
    const str = String(value);
    if (/[",\n]/.test(str)) {
        return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
};

export const buildCsv = (rows) => {
    return rows
        .map((row) => row.map(escapeCsvValue).join(','))
        .join('\n');
};

export const downloadTextFile = (filename, text, mime = 'text/plain') => {
    const blob = new Blob([text], { type: `${mime};charset=utf-8` });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();

    URL.revokeObjectURL(url);
};

export const downloadCsv = (filename, rows) => {
    downloadTextFile(filename, buildCsv(rows), 'text/csv');
};

export const openPrintWindow = ({ title, html }) => {
    const w = window.open('', '_blank');
    if (!w) return;

    w.document.open();
    w.document.write(`<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${title}</title>
<style>
  body{font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;color:#111;margin:24px;}
  h1{font-size:18px;margin:0 0 8px 0;}
  h2{font-size:14px;margin:18px 0 8px 0;}
  .meta{color:#555;font-size:12px;margin-bottom:16px;}
  table{width:100%;border-collapse:collapse;margin-top:6px;}
  th,td{border:1px solid #e5e7eb;padding:8px;font-size:12px;vertical-align:top;}
  th{background:#f9fafb;text-align:left;}
  .muted{color:#666;}
</style>
</head>
<body>
${html}
<script>
  setTimeout(() => { window.focus(); window.print(); }, 250);
</script>
</body>
</html>`);
    w.document.close();
};
