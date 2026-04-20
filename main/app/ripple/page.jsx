export default async function RipplePage() {
    return (<main className="bg-black p-3 h-screen font-sans text-white flex flex-col items-center justify-center gap-4 px-10">
        <h1 className="text-2xl font-bold">What is Ripple?</h1>
        <p className="text-sm text-justify text-gray-400">Ripple is a service that keeps track of my presence. If I haven't checked-in through an API endpoint for the last 2 days then it'll show a mild alert, if the number of days I've been missing is greater than 14, it shows a list of alerts in red, and then start a sequence of actions currently unknown to anyone. It automatically triggers as soon as someone visits the site, and also through a cronjob i've setup to call the endpoint every day.</p>
        <p className="text-sm text-justify text-gray-400">
            Ripple's endpoint is <a href="/api/me" className="italic hover:underline">/api/me</a> and can be seen on the <a className="italic hover:underline" href="/">homepage</a>.
        </p>

        <p className="mt-1 text-[10px] text-gray-600 font-mono">
            <a href="/" className="hover:underline">Home</a> · Ripple · Alimad Intelligence · © 2026
        </p>
    </main>);
}