import Header from "@/components/header";
import RegisterForm from "@/components/RegisterForm";

export default function RegisterPage() {
  return (
    <>
      <Header />
      <main className="new-product-page">
        <header className="products-header">
          <h1>Join Handcrafted Haven</h1>
          <p>Create an account to shop or start selling.</p>
        </header>
        <RegisterForm />
      </main>
    </>
  );
}
