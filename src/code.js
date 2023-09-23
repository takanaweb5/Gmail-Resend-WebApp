"use strict";
function doGet(e) {
    const counter = makeDraftMail();
    return ContentService.createTextOutput(`${counter}件の下書きを作成しました`).setMimeType(ContentService.MimeType.TEXT);
}
/**
 * 再送信ラベルのついたメールから下書きメールを作成する
 */
function makeDraftMail() {
    // ラベルの名前（ここでは「再送信」）を指定
    const labelName = "再送信";
    const emailLabel = GmailApp.getUserLabelByName(labelName);
    let count = 0;
    // ラベルが存在する場合
    if (emailLabel) {
        const threads = emailLabel.getThreads();
        for (let i = 0; i < threads.length; i++) {
            let message = getMessageWithOnlyMeAsSender(threads[i]);
            if (message) {
                createDraftFromMessage(message);
                message.getThread().removeLabel(emailLabel);
                count++;
            }
        }
    }
    return count;
}
/**
 * 送信済みメールから下書きメールを作成
 * @param message - 送信済みメール
 * @return - なし
 */
function createDraftFromMessage(message) {
    // GmailMessageから受信者、件名、本文を取得
    var recipient = message.getTo(); // 受信者のアドレス
    var subject = message.getSubject(); // 件名
    var body = message.getPlainBody(); // 本文（プレーンテキスト）
    // 下書きメールを作成
    var draft = GmailApp.createDraft(recipient, subject, body);
    if (draft) {
        Logger.log("下書きメールが作成されました。");
    }
    else {
        Logger.log("下書きメールの作成に失敗しました。");
    }
}
/**
 * メールスレッド（会話のやりとりを１つの塊にまとめたもの）の中から自分の送った最初の送信メールを取得する
 * @param thread - メールスレッド
 * @return 自分の送った最初の送信メール
 */
function getMessageWithOnlyMeAsSender(thread) {
    const myEmailAddress = Session.getActiveUser().getEmail(); // 自分のメールアドレスを取得
    const messages = thread.getMessages(); // スレッド内のメッセージを取得
    // for (let i = 0; i < messages.length; i++) {
    //   Logger.log(i);
    //   Logger.log(messages[i].getFrom());
    //   Logger.log(messages[i].getTo());
    //   Logger.log(messages[i].getSubject());
    //   Logger.log(messages[i].getPlainBody());
    //   }
    const firstMessage = messages[0]; // スレッド内の最古のメッセージを取得
    const sender = firstMessage.getFrom(); // 発信者を取得
    // 最初のメッセージの発信者が自分のメールアドレスのみを含み、かつ複数の発信者ではない場合
    if (sender.includes(myEmailAddress) && !sender.includes(",")) {
        return firstMessage; // メッセージを返す
    }
    // 条件を満たすメッセージが見つからない場合
    return null;
}
