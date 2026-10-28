import Head from "next/head";

export default function SEO({ title, description, path, noindex = false }) {
  return (
    <Head>
      <title>{title}</title>
      <meta name="description" content={description} />
      {noindex && <meta name="robots" content="noindex, nofollow" />}
      <link rel="canonical" href={`https://mercedonius.sae963.com${path}`} />
    </Head>
  );
}