const fs = require('fs'); 
const exec = require('child_process').exec;

const component = process.argv[2];

fs.readFile("./src/components/template.html", "utf8", (err, source) => {
    if (err) return console.error(err);

    const content = source.replace(/COMPONENT_NAME/g, component);

    if (fs.existsSync(`./src/components/${component}.html`)) {
        return console.error(`${component}.html already exists, use another name`);
    }

    fs.writeFile(`./src/components/${component}.html`, content, (err) => {
        if (err) return console.error(`There is a problem in creating ${component}.html`);

        fs.writeFile(`./src/assets/sass/components/${component}.scss`, '', (err) => {
            if (err) return console.error(`There is a problem in creating ${component}.scss`);

            console.log(`${component} created successfully!`);

            fs.appendFile(`./src/assets/sass/components/_components.scss`, `@import "${component}";\n`, (err) => {
                if (err) return console.error(`There is a problem in appending ${component}.scss`);
                
                console.log(`${component} appended successfully!`);

                // ✅ تعديل ملف webpack.config.js مع تنسيق صحيح
                const webpackConfigPath = './webpack.config.js';
                fs.readFile(webpackConfigPath, 'utf8', (err, data) => {
                    if (err) return console.error(`Error reading webpack.config.js:`, err);

                    const pluginEntry = `        new HtmlWebpackPlugin({\n` +
                                        `            filename: "components/${component}.html",\n` +
                                        `            template: "./src/components/${component}.html",\n` +
                                        `            chunks: ['app'] \n` +
                                        `        })`;

                    // ✅ التحقق مما إذا كان المكون مضافًا مسبقًا لمنع التكرار
                    if (data.includes(pluginEntry)) {
                        console.log(`HtmlWebpackPlugin for ${component} is already added in webpack.config.js`);
                        return;
                    }

                    // ✅ البحث عن آخر `HtmlWebpackPlugin` وإضافة الجديد بعده بنفس التنسيق
                    const pluginsRegex = /(plugins:\s*\[[\s\S]*?)(\n\s*\])/;
                    const match = data.match(pluginsRegex);

                    if (!match) {
                        return console.error("Error: Could not find plugins array in webpack.config.js");
                    }

                    const updatedData = data.replace(
                        pluginsRegex,
                        `${match[1]},\n${pluginEntry}${match[2]}`
                    );

                    // ✅ كتابة التعديلات إلى webpack.config.js
                    fs.writeFile(webpackConfigPath, updatedData, (err) => {
                        if (err) return console.error(`Error updating webpack.config.js:`, err);
                        
                        console.log(`HtmlWebpackPlugin for ${component} added successfully to webpack.config.js!`);

                        // ✅ فتح الملفات تلقائيًا في VS Code
                        exec(`code -r ./src/components/${component}.html`, (err) => {
                            if (err) return console.error(err);
                        });
                        exec(`code -r ./src/assets/sass/components/${component}.scss`, (err) => {
                            if (err) return console.error(err);
                        });
                        exec(`code -r ${webpackConfigPath}`, (err) => {
                            if (err) return console.error(err);
                        });
                    });
                });
            });
        });
    });
});
