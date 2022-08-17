window.addEventListener('DOMContentLoaded', () => {
	const escapeHtml = (unsafe) =>
		unsafe
			.replaceAll('&', '&amp;')
			.replaceAll('<', '&lt;')
			.replaceAll('>', '&gt;')
			.replaceAll('"', '&quot;')
			.replaceAll("'", '&#039;');

	document.body.insertAdjacentHTML("beforeend", `
		<div id="overlay">
			<div id="menu-wrapper">
				<ul id="pron-menu">
				</ul>
			</div>
		</div>
	`);
	const overlay = document.getElementById("overlay");
	overlay.addEventListener("click", () => {
		overlay.style.display = "none";
	});
	const menu = document.getElementById("pron-menu");
	for (const ruby of document.getElementsByTagName("ruby")) {
		const rubies = JSON.parse(ruby.attributes["data-candidates"].value);
		ruby.addEventListener("click", () => {
			overlay.style.display = "flex";
			const html = rubies.map(([poss, prons]) => {
				const pos_str = poss.map(escapeHtml).join(", ");
				const spans = prons
					.map(pron => `<span class="choose-pron">${escapeHtml(pron)}</span>`)
					.join(", ");
				return `<li> ${pos_str}: ${spans} </li>`;
			}).join("");
			menu.innerHTML = html;
			for(const span of document.getElementsByClassName("choose-pron")) {
				span.addEventListener("click", () => {
					ruby.getElementsByTagName("rt")[0].innerText = span.innerText;
				});
			}
		});
	}
});
