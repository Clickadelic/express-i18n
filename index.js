const express = require("express")
const app = express()
const port = 3000
const fs = require("fs")
const path = require("path")

const supportedLanguages = ["en", "de"]

app.set("view engine", "twig")
app.set("view cache", false)
app.set("views", __dirname + "/views")
app.use((req, res, next) => {
	const segments = req.path.split("/").filter(Boolean)
	const lang = supportedLanguages.includes(segments[0]) ? segments[0] : "en"

	res.locals.lang = lang
	res.locals.pathWithoutLang = "/" + segments.slice(1).join("/")

	// Übersetzungen laden
	const translationsPath = path.join(__dirname, "locales", `${lang}.json`)
	try {
		const translations = JSON.parse(fs.readFileSync(translationsPath, "utf-8"))
		res.locals.translations = translations
	} catch (err) {
		console.error("Fehler beim Laden der Übersetzungen:", err)
		res.locals.translations = {}
	}

	// Übersetzungsfunktion für Twig
	res.locals.t = key => {
		return res.locals.translations[key] || key
	}

	next()
})
app.use((req, res, next) => {
	const segments = req.path.split("/").filter(Boolean)

	// Sprache ist das erste Segment (z. B. 'de' oder 'en')
	const supportedLanguages = ["de", "en"]
	const lang = supportedLanguages.includes(segments[0]) ? segments[0] : "en"

	res.locals.lang = lang // z. B. 'de'
	res.locals.pathWithoutLang = "/" + segments.slice(1).join("/") // z. B. '/about'

	next()
})

app.use((req, res, next) => {
	const segments = req.path.split("/").filter(Boolean)
	const supportedLanguages = ["de", "en"]

	if (!supportedLanguages.includes(segments[0])) {
		return res.redirect("/en" + req.path)
	}
	next()
})

app.get("/:lang", (req, res) => {
	res.render("./pages/index", { lang: res.locals.lang })
})

app.listen(port, () => {
	console.log(`Server is running on http://localhost:${port}`)
})
