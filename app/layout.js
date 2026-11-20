import '../styles.css';

export const metadata = {
    title: 'Sudoku Game',
    description: 'A Sudoku game built with React.'
};

const RootLayout = ({ children }) => (
    <html lang="en">
        <body>{children}</body>
    </html>
);

export default RootLayout;
