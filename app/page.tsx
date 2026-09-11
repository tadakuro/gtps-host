import { headers } from "next/headers";
import { getServerData } from "@/lib/server-data";
import { buildHostFileName, buildPtunnelConfig } from "@/lib/host-file";
import EyeMascot from "@/components/EyeMascot";
import PageBackground from "@/components/PageBackground";
import CopyButton from "@/components/CopyButton";
import SocialIcon from "@/components/SocialIcon";

function featureIcon(index: number) {
  switch (index % 4) {
    case 0: return "✦";
    case 1: return "◆";
    case 2: return "★";
    default: return "●";
  }
}

export default async function HomePage() {
  const data = await getServerData();

  const headerList = headers();
  const host = headerList.get("host") ?? "yourdomain.com";
  const protocol = headerList.get("x-forwarded-proto") ?? "https";
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ??
    `${protocol}://${host.replace(/:\d+$/, "")}`;
  const hostFileUrl = `${siteUrl.replace(/\/$/, "")}/r/host.txt`;
  const hostFileName = buildHostFileName(data.hostFileName || data.serverName);

  return (
    <>
      <PageBackground
        type={data.background.type}
        mediaUrl={data.background.mediaUrl}
        overlayOpacity={data.background.overlayOpacity}
      />

      <EyeMascot
        imageUrl={data.eyeImageUrl || undefined}
        speechText={data.speechText || undefined}
      />

      <div className="container mx-auto w-full max-w-6xl overflow-x-hidden px-5 py-8">
        {/* Hero */}
        <section className="py-24 text-center">
          <h1 className="mx-auto w-fit text-[clamp(1.8rem,8vw,3.2rem)] font-bold leading-tight text-transparent bg-gradient-to-r from-neon to-neon-light bg-clip-text font-orbitron">
            {data.description || `Welcome to ${data.serverName}!`}
          </h1>

          <div className="mb-10 inline-flex items-center gap-3 rounded-full bg-gradient-to-br from-neon to-neon-dark px-10 py-3.5 text-lg font-bold text-black shadow-[0_0_30px_rgba(0,255,136,0.6)]">
            STATUS SERVER : {data.status.toUpperCase()}
          </div>

          {/* Social buttons */}
          {data.socialLinks.length > 0 && (
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              {data.socialLinks.map((link, i) => (
                <a
                  key={`${link.label}-${i}`}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-social"
                >
                  {link.iconUrl ? (
                    <img
                      src={link.iconUrl}
                      alt={link.label}
                      className="h-7 w-7"
                    />
                  ) : (
                    <SocialIcon label={link.label} url={link.url} />
                  )}
                  {link.label}
                </a>
              ))}
            </div>
          )}
        </section>

        {/* Downloads */}
        {data.downloadCards.length > 0 && (
          <section className="py-16">
            <h2 className="mb-10 text-center font-orbitron text-[clamp(1.6rem,6vw,2.4rem)] text-neon">
              {data.downloadHeading}
            </h2>

            <div className="grid gap-6 [grid-template-columns:repeat(auto-fit,minmax(min(340px,100%),1fr))]">
              {data.downloadCards.map((card, i) => {
                const copyText = card.hostBlock
                  ? buildPtunnelConfig(data)
                  : card.copyText;
                return (
                  <div key={`card-${i}`} className="card-glow text-center">
                    <h3
                      className="mb-5 text-xl font-bold text-neon"
                      style={{ color: "#00ff88" }}
                    >
                      {card.title}
                    </h3>

                    {card.subtitle && (
                      <p className="mb-3 text-sm text-zinc-400">
                        {card.subtitle}
                      </p>
                    )}

                    {card.buttons.map((btn, j) =>
                      btn.type === "host" ? (
                        <a
                          key={`btn-${i}-${j}`}
                          href="/r/host.txt"
                          download={hostFileName}
                          className="btn-neon mb-3 block"
                        >
                          {btn.label}
                        </a>
                      ) : btn.type === "copylink" ? (
                        <CopyButton
                          key={`btn-${i}-${j}`}
                          textToCopy={hostFileUrl}
                          label={btn.label || "Copy Host Link"}
                          className="mb-3 block"
                        />
                      ) : btn.url.trim() ? (
                        <a
                          key={`btn-${i}-${j}`}
                          href={btn.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-neon mb-3 block"
                        >
                          {btn.label}
                        </a>
                      ) : null
                    )}

                    {card.note && (
                      <p className="mb-3 mt-5 font-semibold text-neon">
                        {card.note}
                      </p>
                    )}

                    {copyText && (
                      <>
                        <div className="link-box my-4 whitespace-pre-wrap text-left text-sm font-mono">
                          {copyText}
                        </div>
                        <CopyButton textToCopy={copyText} label="Copy" />
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* PC Host Section */}
        {data.showPcSection && data.hosts.length > 0 && (
          <section className="py-16">
            <div className="card-glow">
              <h3 className="mb-4 text-xl font-bold text-neon">
                Windows & macOS
              </h3>
              {data.pcNote && (
                <p className="mb-3 text-sm text-zinc-400">{data.pcNote}</p>
              )}
              {data.hosts.map((h, i) => (
                <p key={`host-${i}`} className="font-mono text-white/90">
                  {data.ip} {h}
                </p>
              ))}
            </div>
          </section>
        )}

        {/* PowerTunnel */}
        {data.showPowerTunnelSection && (
          <section className="py-16">
            <h2 className="mb-6 text-center font-orbitron text-[clamp(1.3rem,5vw,2rem)] text-neon">
              PowerTunnel
            </h2>
            <div className="card-glow text-left">
              <p className="text-zinc-300">
                For PowerTunnel (Android): copy this hosts file link into the
                app settings.
              </p>

              <div className="link-box my-4 font-mono">{hostFileUrl}</div>

              <CopyButton textToCopy={hostFileUrl} label="Copy Link" />

              <p className="mt-4 text-xs text-zinc-500">
                Raw file also available at{" "}
                <code className="text-zinc-400">/r/host</code>.
              </p>
            </div>
          </section>
        )}

        {/* iOS Host */}
        {data.showIosSection && (
          <section className="py-16">
            <h2 className="mb-6 text-center font-orbitron text-[clamp(1.3rem,5vw,2rem)] text-neon">
              iOS Host
            </h2>
            <div className="card-glow text-left">
              <p className="text-zinc-300">
                For iOS clients: use this bypass config to connect to your
                server.
              </p>

              <div className="link-box my-4 whitespace-pre-wrap font-mono text-sm">
                {buildPtunnelConfig(data)}
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <a
                  className="btn-neon"
                  href="/r/ios"
                  download={`${hostFileName.replace(/\.txt$/i, "")}-ios.txt`}
                >
                  Download Config
                </a>
                <CopyButton
                  textToCopy={buildPtunnelConfig(data)}
                  label="Copy Config"
                />
              </div>
            </div>
          </section>
        )}

        {/* Features */}
        {data.features.length > 0 && (
          <section className="py-16">
            <h2 className="mb-8 text-center font-orbitron text-[2rem] text-neon">
              Features
            </h2>
            <ul className="grid gap-4 sm:grid-cols-2">
              {data.features.map((feature, i) => (
                <li
                  key={feature + String(i)}
                  className="flex items-center gap-4 rounded-2xl border-2 border-neon bg-[rgba(15,15,15,0.85)] p-5 transition-transform hover:-translate-y-1"
                >
                  <span className="text-neon">{featureIcon(i)}</span>
                  <span className="text-zinc-200">{feature}</span>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </>
  );
}
