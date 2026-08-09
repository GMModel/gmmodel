"use client";

import { useStore } from "@/context/StoreContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FloatingWidgets from "@/components/FloatingWidgets";

const CONTENT = {
  vi: {
    title: "Chính Sách Bảo Mật",
    updated: "Cập nhật lần cuối: 07/08/2026",
    sections: [
      {
        h: "1. Thông tin chúng tôi thu thập",
        p: [
          "Khi bạn tạo tài khoản, đặt hàng hoặc liên hệ với chúng tôi, chúng tôi có thể thu thập: họ tên, email, số điện thoại, địa chỉ giao hàng, và lịch sử đơn hàng.",
          "Chúng tôi không thu thập hoặc lưu trữ số thẻ ngân hàng, mã CVV hay thông tin đăng nhập ví điện tử của bạn — các thông tin này được xử lý trực tiếp bởi đối tác thanh toán (MoMo, PayPal, cổng thanh toán thẻ).",
        ],
      },
      {
        h: "2. Cách chúng tôi sử dụng thông tin",
        p: [
          "Thông tin của bạn được dùng để: xử lý và giao đơn hàng, liên hệ hỗ trợ khi cần, gửi thông báo trạng thái đơn hàng, và cải thiện trải nghiệm mua sắm trên website.",
          "Chúng tôi không bán hoặc cho thuê thông tin cá nhân của bạn cho bên thứ ba vì mục đích quảng cáo.",
        ],
      },
      {
        h: "3. Chia sẻ thông tin",
        p: [
          "Thông tin giao hàng (tên, địa chỉ, số điện thoại) được chia sẻ với đơn vị vận chuyển để thực hiện giao hàng. Thông tin thanh toán được xử lý bởi đối tác thanh toán tương ứng (MoMo, PayPal...). Chúng tôi chỉ chia sẻ thông tin cần thiết để hoàn tất đơn hàng.",
        ],
      },
      {
        h: "4. Cookie",
        p: [
          "Website sử dụng cookie để ghi nhớ ngôn ngữ bạn chọn, phiên đăng nhập, và nội dung giỏ hàng. Bạn có thể tắt cookie trong trình duyệt, tuy nhiên một số chức năng của website (đăng nhập, giỏ hàng) có thể không hoạt động đúng nếu tắt cookie.",
        ],
      },
      {
        h: "5. Bảo mật dữ liệu",
        p: [
          "Mật khẩu tài khoản được mã hoá trước khi lưu trữ. Kết nối đến website được bảo vệ bằng HTTPS. Tuy nhiên, không có phương thức truyền tải dữ liệu nào qua Internet là an toàn tuyệt đối 100%.",
        ],
      },
      {
        h: "6. Quyền của bạn",
        p: [
          "Bạn có quyền yêu cầu xem, chỉnh sửa hoặc xoá thông tin cá nhân của mình. Vui lòng liên hệ chúng tôi qua trang Liên hệ để thực hiện các yêu cầu này.",
        ],
      },
      {
        h: "7. Thay đổi chính sách",
        p: ["Chính sách này có thể được cập nhật theo thời gian. Phiên bản mới nhất luôn được đăng tải tại trang này."],
      },
      {
        h: "8. Liên hệ",
        p: ["Nếu có câu hỏi về chính sách bảo mật, vui lòng liên hệ qua trang Liên hệ hoặc số điện thoại +84 347 347 823."],
      },
    ],
  },
  en: {
    title: "Privacy Policy",
    updated: "Last updated: August 7, 2026",
    sections: [
      {
        h: "1. Information we collect",
        p: [
          "When you create an account, place an order, or contact us, we may collect: your name, email, phone number, delivery address, and order history.",
          "We do not collect or store your card numbers, CVV codes, or e-wallet login credentials — these are processed directly by our payment partners (MoMo, PayPal, card processors).",
        ],
      },
      {
        h: "2. How we use your information",
        p: [
          "Your information is used to: process and deliver orders, provide customer support, send order status updates, and improve your shopping experience on this website.",
          "We do not sell or rent your personal information to third parties for advertising purposes.",
        ],
      },
      {
        h: "3. Sharing information",
        p: [
          "Delivery details (name, address, phone number) are shared with shipping carriers to fulfill your order. Payment details are processed by the relevant payment partner (MoMo, PayPal, etc.). We only share the information necessary to complete your order.",
        ],
      },
      {
        h: "4. Cookies",
        p: [
          "This website uses cookies to remember your selected language, login session, and cart contents. You may disable cookies in your browser, though some site features (login, cart) may not work correctly without them.",
        ],
      },
      {
        h: "5. Data security",
        p: [
          "Account passwords are encrypted before storage. Connections to this website are protected with HTTPS. However, no method of transmission over the Internet is 100% secure.",
        ],
      },
      {
        h: "6. Your rights",
        p: [
          "You have the right to request access to, correction of, or deletion of your personal data. Please contact us via our Contact page to make such a request.",
        ],
      },
      {
        h: "7. Changes to this policy",
        p: ["This policy may be updated from time to time. The latest version is always posted on this page."],
      },
      {
        h: "8. Contact",
        p: ["For questions about this privacy policy, please reach out via our Contact page or call +84 347 347 823."],
      },
    ],
  },
  es: {
    title: "Política de Privacidad",
    updated: "Última actualización: 7 de agosto de 2026",
    sections: [
      {
        h: "1. Información que recopilamos",
        p: [
          "Cuando creas una cuenta, realizas un pedido o te pones en contacto con nosotros, podemos recopilar: tu nombre, correo electrónico, número de teléfono, dirección de entrega e historial de pedidos.",
          "No recopilamos ni almacenamos los números de tu tarjeta, códigos CVV ni credenciales de acceso a monederos electrónicos — estos datos son procesados directamente por nuestros socios de pago (MoMo, PayPal, procesadores de tarjeta).",
        ],
      },
      {
        h: "2. Cómo usamos tu información",
        p: [
          "Tu información se utiliza para: procesar y entregar pedidos, brindar atención al cliente, enviar actualizaciones sobre el estado del pedido y mejorar tu experiencia de compra en este sitio web.",
          "No vendemos ni alquilamos tu información personal a terceros con fines publicitarios.",
        ],
      },
      {
        h: "3. Compartir información",
        p: [
          "Los datos de entrega (nombre, dirección, teléfono) se comparten con las empresas de transporte para completar el envío. Los datos de pago son procesados por el socio de pago correspondiente (MoMo, PayPal, etc.). Solo compartimos la información necesaria para completar tu pedido.",
        ],
      },
      {
        h: "4. Cookies",
        p: [
          "Este sitio web utiliza cookies para recordar el idioma seleccionado, tu sesión de inicio de sesión y el contenido del carrito. Puedes desactivar las cookies en tu navegador, aunque algunas funciones del sitio (inicio de sesión, carrito) podrían no funcionar correctamente sin ellas.",
        ],
      },
      {
        h: "5. Seguridad de los datos",
        p: [
          "Las contraseñas de las cuentas se cifran antes de almacenarse. Las conexiones a este sitio están protegidas mediante HTTPS. Sin embargo, ningún método de transmisión por Internet es 100% seguro.",
        ],
      },
      {
        h: "6. Tus derechos",
        p: [
          "Tienes derecho a solicitar el acceso, la corrección o la eliminación de tus datos personales. Ponte en contacto con nosotros a través de nuestra página de Contacto para realizar dicha solicitud.",
        ],
      },
      {
        h: "7. Cambios en esta política",
        p: ["Esta política puede actualizarse periódicamente. La versión más reciente siempre estará publicada en esta página."],
      },
      {
        h: "8. Contacto",
        p: ["Si tienes preguntas sobre esta política de privacidad, contáctanos a través de nuestra página de Contacto o al teléfono +84 347 347 823."],
      },
    ],
  },
};

export default function PrivacyPageClient() {
  const { locale } = useStore();
  const content = CONTENT[locale] ?? CONTENT.en;

  return (
    <>
      <Header />
      <main className="flex-1 bg-black px-4 py-12 text-white md:px-8">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-2xl font-black tracking-tight md:text-3xl">{content.title}</h1>
          <p className="mt-2 text-xs text-white/40">{content.updated}</p>

          <div className="mt-8 flex flex-col gap-8">
            {content.sections.map((section) => (
              <div key={section.h}>
                <h2 className="text-sm font-bold uppercase text-white/90">{section.h}</h2>
                <div className="mt-2 flex flex-col gap-2">
                  {section.p.map((para, i) => (
                    <p key={i} className="text-sm leading-relaxed text-white/70">
                      {para}
                    </p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
      <FloatingWidgets />
    </>
  );
}
