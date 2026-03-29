const fs = require('fs')
const path = require('path')

const arrayDirs = ['dist', 'dist/s', 'dist/l', 'dist/r', 'dist/r', 'dist/n', 'dist/y', 'dist/y', 'dist/g', 'dist/a', 'dist/a']
const arrayHtml = ['index.html', 'index.html', 'index.html', 'index.html', '[rId].html', '[nId].html', 'index.html', '[yId].html', 'index.html', 'index.html', '[aId].html']

for (let i = 0; i < arrayDirs.length; i++) {
  // 1. Путь к index.html
  const htmlPath = path.join(__dirname, arrayDirs[i], arrayHtml[i])

  // 2. Читаем текущий index.html
  try {
    const html = fs.readFileSync(htmlPath, 'utf8')

    // 3. Вставляем код перед <!DOCTYPE html>
    const customCode1 =
      '<?php\n' +
      'header("Cache-Control: no-cache, no-store, must-revalidate");\n' +
      'header("Pragma: no-cache");\n' +
      'header("Expires: 0");\n' +
      '\n' +
      "$urlMain = 'https://a.onlinetur.ru';\n" +
      "$urlNews = 'https://zagrebon.com';\n" +
      "$urlChat = $urlMain . '/api/chat_v3/get_info_title.php?';\n" +
      '$urlChat0 = $urlChat;\n' +
      "$title = 'Клуб тревел-экспертов. Рейтинги отелей';\n" +
      "$image = '/images/logo_app.png';\n" +
      "$description = 'Рейтинги и прямое бронирование отелей. Клуб тревел-экспертов';\n" +
      '\n' +
      'function curlChat($url)\n' +
      '{\n' +
      '    $ch = curl_init();\n' +
      '    $timeout = 5;\n' +
      '    curl_setopt($ch, CURLOPT_URL, $url);\n' +
      '    curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);\n' +
      '    curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);\n' +
      '    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);\n' +
      '    curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, $timeout);\n' +
      '    $output = curl_exec($ch);\n' +
      '    curl_close($ch);\n' +
      '\n' +
      '    if ($output === false) {\n' +
      '        return null;\n' +
      '    }\n' +
      '\n' +
      '    return json_decode($output, true);\n' +
      '}\n' +
      '\n' +
      'function getData($uri)\n' +
      '{\n' +
      '    $result = [];\n' +
      '    global $urlMain, $urlNews, $urlChat, $urlChat0;\n' +
      '\n' +
      "    if (strpos($uri, '/n/') !== false) {\n" +
      "        $request = explode('/', $_SERVER['REQUEST_URI']);\n" +
      "        $pos = strpos($request[2], '?');\n" +
      '\n' +
      '        if (!$pos) {\n' +
      "            $pos = strpos($request[2], '#');\n" +
      '        }\n' +
      '\n' +
      '        if ($pos) {\n' +
      '            $id = substr($request[2], 0, $pos);\n' +
      '        } else {\n' +
      '            $id = $request[2];\n' +
      '        }\n' +
      "        $url = $urlNews . '/i' . $id . '.json?u=';\n" +
      '\n' +
      '        $article = curlChat($url);\n' +
      '\n' +
      '        if (!$article) {\n' +
      '            return null;\n' +
      '        }\n' +
      '\n' +
      "        if ($article['type'] === 1) {\n" +
      "            $title = $article['title'];\n" +
      "            $description = $article['short_description'];\n" +
      "            $image = !empty($article['content'][0]['array'][0]) ? $article['content'][0]['array'][0] : $article['cover_image'];\n" +
      "        } elseif ($article['type'] === 18 || $article['type'] === 9 || $article['type'] === 17) {\n" +
      "            $title = $article['title'];\n" +
      "            $description = $article['short_description'];\n" +
      '\n' +
      "            for ($i = 0; $i < count($article['content']); $i++) {\n" +
      "                if ($article['content'][$i]['type'] === 'image') {\n" +
      "                    $image = !empty($article['content'][$i]['string']) ? $urlNews . $article['content'][$i]['string'] : '';\n" +
      '                    break;\n' +
      '                }\n' +
      '            }\n' +
      '\n' +
      '            if (!$image) {\n' +
      "                $image = $article['cover_image'];\n" +
      '            }\n' +
      '        }\n' +
      '    } else {\n' +
      '        $geturl = str_replace("#", "/", str_replace("?", "/", $_SERVER[\'REQUEST_URI\']));\n' +
      "        $request = explode('/', $geturl);\n" +
      '\n' +
      '        foreach(array_keys($request) as $key)\n' +
      '        {\n' +
      '            if (empty($key) ) continue;\n' +
      '\n' +
      "            if ($request[$key]=='y' && $key==1 && !empty($request[$key+1]))\n" +
      '            {\n' +
      "                $urlChat .= 'id_post='.intval($request[$key+1]).'&';\n" +
      "            } elseif ($request[$key]=='a' && $key==1 && !empty($request[$key+1])) {\n" +
      "                $urlChat .= 'id_post='.intval($request[$key+1]).'&';\n" +
      "            } elseif ($request[$key]=='h' && !empty($request[$key+1])) {\n" +
      "                $urlChat .= 'id_hotel=' . (intval($request[$key+1]) + 100000).'&';\n" +
      "            } elseif ($request[$key]=='p' && !empty($request[$key+1])) {\n" +
      "                $urlChat .= 'id_hotel=' . (intval($request[$key+1]) * -1 - 100000).'&';\n" +
      "            } elseif ($request[$key]=='b' && !empty($request[$key+1])) {\n" +
      "                $urlChat .= 'id_hobbi=' . intval($request[$key+1]).'&';\n" +
      "            } elseif ($request[$key]=='bonus' && $key==1) {\n" +
      "                $title .='Личные бонусы';\n" +
      "            } elseif ($request[$key]=='fav' && $key==1) {\n" +
      "                $title .='Мои заметки';\n" +
      "            } elseif ($request[$key]=='profile' && $key==1) {\n" +
      "                $title .='Настройки';\n" +
      "            } elseif ($request[$key]=='l' && $key==1) {\n" +
      "                $title .='Новости и обзоры';\n" +
      "            } elseif ($request[$key]=='r' && $key==1) {\n" +
      "                $title .='Рейтинги отелей';\n" +
      '            }\n' +
      '\n' +
      "            if ($request[$key]=='a' && $urlChat) break;\n" +
      '\n' +
      '        }\n' +
      '\n' +
      '        if (empty($title) && $urlChat != $urlChat0 ) $chat = curlChat($urlChat);\n' +
      '\n' +
      "        if ($chat['code'] === 0) {\n" +
      "            $title = !empty($chat['name_strana']) ? '' . $chat['name_strana'] : '';\n" +
      "            $title .= !empty($chat['name_hotel_kurrot']) ? '. ' . $chat['name_hotel_kurrot'] : '';\n" +
      "            $title .= !empty($chat['name_hobbi']) ? '. ' . $chat['name_hobbi'] : '';\n" +
      "            $title .= !empty($title) ? (empty($chat['business']) ?' (бизнес-чат)' : ' (чат)') : '';\n" +
      "            $description = $chat['description'];\n" +
      '        }\n' +
      '    }\n' +
      '\n' +
      "    $result['title'] = $title;\n" +
      "    $result['image'] = $image;\n" +
      "    $result['description'] = $description;\n" +
      '\n' +
      '    return $result;\n' +
      '}\n' +
      '\n' +
      "$result = getData($_SERVER['REQUEST_URI']);\n" +
      '\n' +
      "if (!empty($result['title'])) {\n" +
      "    $title = $result['title'];\n" +
      "    $image = $result['image'];\n" +
      "    $description = $result['description'];\n" +
      '} else {\n' +
      "    $title = 'Клуб тревел-экспертов. Рейтинги отелей';\n" +
      "    $image = '/images/logo_app.png';\n" +
      "    $description = 'Рейтинги и прямое бронирование отелей. Клуб тревел-экспертов';\n" +
      '}\n' +
      '?>\n'

    const customCode2 =
      '  <script>\n' +
      '    var stl = `body,html{width:100%;height:100%}`;\n' +
      '\n' +
      '    if (window.self !== window.top) {\n' +
      '      stl = `body,html{width:100%;height:98% !important}`;\n' +
      '    }\n' +
      '\n' +
      "    var style = document.createElement('style');\n" +
      '    style.innerHTML = stl;\n' +
      '    document.head.appendChild(style);\n' +
      '  </script></body>'

    const customCode3 = `<title data-rh="true"><?php echo $title; ?></title>
    <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate">
    <meta http-equiv="Pragma" content="no-cache">
    <meta http-equiv="Expires" content="0">
    <meta property="og:title" content="<?php echo $title; ?>"/>
    <meta property="og:description" content="<?php echo $description; ?>"/>
    <meta property="og:image" content="<?php echo $image; ?>"/>
    <meta property="og:locale" content="ru_RU" />
    <meta name="description" content="<?php echo $description; ?>"/>
`

    const modifiedHtml = html.replace('<!DOCTYPE html>', `${customCode1}<!DOCTYPE html>`).replace('</body>', `${customCode2}</body>`).replace('<title data-rh="true"></title>', customCode3)

    // 4. Сохраняем изменённый HTML
    fs.writeFileSync(htmlPath.replace('.html', '.phtml'), modifiedHtml)
    console.log('✓ index.phtml создан')
  } catch (err) {
    console.error('Ошибка при работе с index.html:', err)
    process.exit(1)
  }

  // 5. Удаляем временный файл (пример)
  const tempFilePath = path.join(__dirname, arrayDirs[i], arrayHtml[i])

  try {
    if (fs.existsSync(tempFilePath)) {
      fs.unlinkSync(tempFilePath)
      console.log(`✓ Файл ${tempFilePath} удалён`)
    } else {
      console.log(`ℹ Файл ${tempFilePath} не найден (удаление не требуется)`)
    }
  } catch (err) {
    console.error('Ошибка при удалении файла:', err)
    process.exit(1)
  }
}
