"use strict";
function doGet(e) {
    const counter = makeDraftMail();
    const message = `${counter}件の下書きを作成しました`;
    Logger.log(message);
    const html = e.parameter["h"];
    if (html) {
        // パラメータにhが指定されていたら、HTMLに変換
        return HtmlService.createHtmlOutput(`<font size=100>${message}</font>`);
    }
    else {
        return ContentService.createTextOutput(message).setMimeType(ContentService.MimeType.TEXT);
    }
}
/**
 * 再送信ラベルのついたメールから下書きメールを作成する
 */
function makeDraftMail() {
    // ラベルの名前（ここでは「再送信」）を指定
    const labelName = "再送信";
    const emailLabel = GmailApp.getUserLabelByName(labelName);
    let counter = 0;
    // ラベルが存在する場合
    if (emailLabel) {
        const threads = emailLabel.getThreads();
        for (const thread of threads) {
            // メールスレッド（会話のやりとりを１つの塊にまとめたもの）の最古のメール
            let message = thread.getMessages()[0];
            if (createDraftFromMessage(message)) {
                thread.removeLabel(emailLabel);
                counter++;
            }
        }
    }
    return counter;
}
/**
 * 送信済みメールから下書きメールを作成
 * @param message - 送信済みメール
 * @return - なし
 */
function createDraftFromMessage(message) {
    const recipient = message.getTo(); // 受信者のアドレス
    const subject = message.getSubject(); // 件名
    const body = message.getPlainBody(); // 本文（プレーンテキスト）
    return Boolean(GmailApp.createDraft(recipient, subject, body));
}
