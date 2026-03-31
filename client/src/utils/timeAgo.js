export function timeAgo(unix) {
	const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
	const diff = (unix * 1000 - Date.now()) / 1000;

	if (Math.abs(diff) < 60) return rtf.format(Math.round(diff), "second");
	if (Math.abs(diff) < 3600) return rtf.format(Math.round(diff / 60), "minute");
	if (Math.abs(diff) < 86400)
		return rtf.format(Math.round(diff / 3600), "hour");
	if (Math.abs(diff) < 2592000)
		return rtf.format(Math.round(diff / 86400), "day");
	if (Math.abs(diff) < 31536000)
		return rtf.format(Math.round(diff / 2592000), "month");

	return rtf.format(Math.round(diff / 31536000), "year");
}