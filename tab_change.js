function changeTab(clickedbutton) {
    const buttons = document.querySelectorAll('.tab-button');
    const contents = document.querySelectorAll('.tab-content');

    buttons.forEach(button => {
            // すべてのタブを非アクティブにする
            button.classList.remove('active');
            contents.forEach(content => content.style.display = 'none');

            // クリックされたタブをアクティブにする
            clickedbutton.classList.add('active');
            const tabId = clickedbutton.getAttribute('data-tab');
            document.getElementById(tabId).style.display = 'block';
    });
}