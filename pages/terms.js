// src/pages/terms.js
export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto p-8 text-gray-800">
      <h1 className="text-3xl font-bold text-pink-600 mb-6">
        利用規約・免責事項
      </h1>

      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">第1条（適用）</h2>
        <p>
          本利用規約は、ScenaMe（以下「本サービス」）が提供するAI恋愛診断サービスに関する一切の利用に適用されます。
          本サービスを利用した時点で、本規約に同意いただいたものとみなします。
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">第2条（サービス内容）</h2>
        <p>
          本サービスは、生成AIを活用し、恋愛に関するシナリオや診断コンテンツを提供します。
          内容はあくまでフィクションであり、実在の人物・団体とは一切関係ありません。
          また、診断結果の正確性・有効性については一切保証しません。
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">第3条（免責事項）</h2>
        <ul className="list-disc ml-6">
          <li>本サービスの利用により発生したいかなる損害に対しても、運営者は一切責任を負いません。</li>
          <li>生成された内容には、ユーザーにとって不適切または不快に感じる表現が含まれる可能性があります。</li>
          <li>予告なくサービス内容の変更・停止・終了を行うことがあります。</li>
        </ul>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">第4条（禁止事項）</h2>
        <p>以下の行為は禁止されています：</p>
        <ul className="list-disc ml-6">
          <li>他人の名前やプロフィールを無断で使用する行為</li>
          <li>生成された診断・コンテンツを無断転載・複製する行為</li>
          <li>商用利用・営利目的での不正利用</li>
        </ul>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">第5条（著作権）</h2>
        <p>
          本サービスで生成されたストーリーや診断結果の著作権は運営者に帰属します。
          個人のSNS等でのシェアは自由ですが、商用利用には事前の許可が必要です。
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">第6条（利用料金と支払い）</h2>
        <p>
          本サービスの基本利用は無料です。ただし、サイト運営継続支援（100円〜）をお願いする場合があります。任意のものになるますので、強制ではありません。
          支払いには、Stripeを通じたクレジットカード決済が利用されます。決済処理はStripe社のセキュアなシステムを通じて行われ、当方ではカード情報を保持しません。
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">第7条（プライバシーとデータ）</h2>
        <p>
          診断に使用されるニックネーム・性別・年代等の情報は、診断体験向上のために一時的にローカル保存されますが、サーバー上には保持しません。
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">第8条（改定）</h2>
        <p>
          本規約は必要に応じて随時改定されます。重要な変更がある場合は、サイト上でお知らせいたします。
        </p>
      </section>

      <footer className="text-sm text-gray-500 mt-10">
        最終更新日：2025年5月25日
      </footer>
    </div>
  );
}
