"use client";

import { useStore } from "@/context/StoreContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FloatingWidgets from "@/components/FloatingWidgets";

const CONTENT = {
  vi: {
    title: "Điều Khoản Dịch Vụ",
    updated: "Cập nhật lần cuối: 07/08/2026",
    sections: [
      {
        h: "1. Giới thiệu",
        p: [
          "GM Model (\"chúng tôi\", \"cửa hàng\") vận hành website bán mô hình xe kim loại diecast và resin tỉ lệ 1:12 đến 1:43, cùng các phụ kiện trưng bày liên quan. Bằng việc truy cập hoặc đặt hàng trên website này, bạn đồng ý với các điều khoản dưới đây.",
        ],
      },
      {
        h: "2. Sản phẩm và giá",
        p: [
          "Hình ảnh sản phẩm mang tính chất minh hoạ; màu sắc, chi tiết thực tế có thể chênh lệch nhẹ so với ảnh do điều kiện màn hình hiển thị hoặc lô sản xuất.",
          "Giá hiển thị đã bao gồm thuế (nếu có) và được niêm yết bằng USD, tự động quy đổi sang VNĐ hoặc EUR theo ngôn ngữ bạn chọn. Chúng tôi có quyền thay đổi giá bất kỳ lúc nào mà không cần báo trước, áp dụng cho đơn hàng đặt sau thời điểm thay đổi.",
          "Đối với sản phẩm đặt trước (pre-order), số lượng phân bổ có hạn theo nhà sản xuất; đơn hàng được xử lý theo thứ tự đặt trước và có thể huỷ nếu nhà sản xuất ngừng phân phối.",
        ],
      },
      {
        h: "3. Đặt hàng và thanh toán",
        p: [
          "Chúng tôi chấp nhận thanh toán khi nhận hàng (COD), ví MoMo, tiền điện tử (USDT/USDC), PayPal và thẻ Visa/Mastercard. Thông tin thẻ và tài khoản thanh toán được xử lý trực tiếp bởi đối tác thanh toán (MoMo, PayPal...); chúng tôi không lưu trữ số thẻ của bạn.",
          "Đơn hàng được xem là hoàn tất khi bạn nhận được email/mã đơn hàng xác nhận. Chúng tôi có quyền từ chối hoặc huỷ đơn hàng trong trường hợp nghi ngờ gian lận, hết hàng hoặc sai sót về giá.",
        ],
      },
      {
        h: "4. Vận chuyển",
        p: [
          "Chúng tôi giao hàng trong nước và quốc tế. Thời gian giao hàng là ước tính, có thể thay đổi do điều kiện vận chuyển, hải quan (đối với đơn quốc tế) hoặc các yếu tố bất khả kháng.",
          "Khách hàng chịu trách nhiệm cung cấp địa chỉ nhận hàng chính xác. Chúng tôi không chịu trách nhiệm cho các chậm trễ hoặc thất lạc do thông tin giao hàng không chính xác.",
        ],
      },
      {
        h: "5. Đổi trả và bảo hành",
        p: [
          "Vui lòng quay video quá trình bóc hộp khi nhận hàng. Nếu sản phẩm bị lỗi từ nhà sản xuất hoặc giao nhầm sản phẩm, bạn sẽ được đổi 1-1 sau khi chúng tôi xác nhận qua video/hình ảnh bạn cung cấp.",
          "Chúng tôi không hỗ trợ đổi trả với lý do không thích/đổi ý sau khi đã mở hộp, trừ trường hợp sản phẩm lỗi hoặc giao sai như mô tả ở trên.",
        ],
      },
      {
        h: "6. Quyền sở hữu trí tuệ",
        p: [
          "Toàn bộ nội dung, hình ảnh, logo trên website thuộc quyền sở hữu của GM Model hoặc được cấp phép sử dụng. Nghiêm cấm sao chép, phân phối lại nhằm mục đích thương mại khi chưa được sự đồng ý.",
        ],
      },
      {
        h: "7. Giới hạn trách nhiệm",
        p: [
          "GM Model không chịu trách nhiệm cho các thiệt hại gián tiếp phát sinh từ việc sử dụng website hoặc sản phẩm, ngoại trừ các trường hợp pháp luật Việt Nam quy định khác.",
        ],
      },
      {
        h: "8. Thay đổi điều khoản",
        p: [
          "Chúng tôi có thể cập nhật điều khoản này theo thời gian. Phiên bản mới nhất luôn được đăng tải tại trang này.",
        ],
      },
      {
        h: "9. Liên hệ",
        p: ["Mọi thắc mắc về điều khoản dịch vụ, vui lòng liên hệ qua trang Liên hệ hoặc số điện thoại +84 347 347 823."],
      },
    ],
  },
  en: {
    title: "Terms of Service",
    updated: "Last updated: August 7, 2026",
    sections: [
      {
        h: "1. Introduction",
        p: [
          'GM Model ("we", "the shop") operates this website selling diecast and resin scale model cars in 1:12 to 1:43 scale, along with related display accessories. By accessing or ordering from this website, you agree to the terms below.',
        ],
      },
      {
        h: "2. Products and pricing",
        p: [
          "Product photos are for illustration purposes; actual color and detail may vary slightly due to display settings or production batch.",
          "Displayed prices include applicable taxes and are listed in USD, automatically converted to VND or EUR based on your selected language. We may change prices at any time without prior notice; changes apply to orders placed after the change.",
          "For pre-order items, manufacturer allocations are limited; orders are processed in the order received and may be cancelled if the manufacturer discontinues distribution.",
        ],
      },
      {
        h: "3. Ordering and payment",
        p: [
          "We accept cash on delivery (COD), MoMo e-wallet, cryptocurrency (USDT/USDC), PayPal, and Visa/Mastercard. Card and payment account details are processed directly by our payment partners (MoMo, PayPal, etc.); we do not store your card numbers.",
          "An order is considered complete once you receive a confirmation email/order code. We reserve the right to refuse or cancel an order in cases of suspected fraud, stock unavailability, or pricing errors.",
        ],
      },
      {
        h: "4. Shipping",
        p: [
          "We ship domestically and internationally. Delivery times are estimates and may vary due to carrier conditions, customs processing (for international orders), or events beyond our control.",
          "Customers are responsible for providing an accurate delivery address. We are not liable for delays or lost shipments caused by incorrect shipping information.",
        ],
      },
      {
        h: "5. Returns and warranty",
        p: [
          "Please record an unboxing video when you receive your order. If the item has a manufacturing defect or the wrong item was shipped, we will provide a 1-for-1 exchange after verifying the video/photo evidence you provide.",
          "We do not accept returns for change-of-mind after the box has been opened, except where the item is defective or incorrect as described above.",
        ],
      },
      {
        h: "6. Intellectual property",
        p: [
          "All content, images, and logos on this website are owned by or licensed to GM Model. Reproduction or redistribution for commercial purposes without permission is prohibited.",
        ],
      },
      {
        h: "7. Limitation of liability",
        p: [
          "GM Model is not liable for indirect damages arising from use of this website or its products, except as otherwise required by applicable Vietnamese law.",
        ],
      },
      {
        h: "8. Changes to these terms",
        p: ["We may update these terms from time to time. The latest version is always posted on this page."],
      },
      {
        h: "9. Contact",
        p: ["For questions about these terms, please reach out via our Contact page or call +84 347 347 823."],
      },
    ],
  },
  es: {
    title: "Términos de Servicio",
    updated: "Última actualización: 7 de agosto de 2026",
    sections: [
      {
        h: "1. Introducción",
        p: [
          'GM Model ("nosotros", "la tienda") opera este sitio web dedicado a la venta de modelos de coches a escala en diecast y resina, de escala 1:12 a 1:43, junto con accesorios de exhibición relacionados. Al acceder o realizar un pedido en este sitio, aceptas los siguientes términos.',
        ],
      },
      {
        h: "2. Productos y precios",
        p: [
          "Las fotos de los productos son ilustrativas; el color y los detalles reales pueden variar ligeramente según la configuración de la pantalla o el lote de producción.",
          "Los precios mostrados incluyen los impuestos aplicables y se indican en USD, convertidos automáticamente a VND o EUR según el idioma seleccionado. Podemos modificar los precios en cualquier momento sin previo aviso; los cambios se aplican a los pedidos realizados después del cambio.",
          "Para los artículos en reserva anticipada, la asignación del fabricante es limitada; los pedidos se procesan por orden de llegada y pueden cancelarse si el fabricante interrumpe la distribución.",
        ],
      },
      {
        h: "3. Pedidos y pago",
        p: [
          "Aceptamos pago contra entrega (COD), monedero MoMo, criptomonedas (USDT/USDC), PayPal y tarjetas Visa/Mastercard. Los datos de tarjeta y de pago son procesados directamente por nuestros socios de pago (MoMo, PayPal, etc.); no almacenamos los números de tu tarjeta.",
          "Un pedido se considera completo una vez que recibes el correo de confirmación o el código de pedido. Nos reservamos el derecho de rechazar o cancelar un pedido en caso de sospecha de fraude, falta de stock o errores de precio.",
        ],
      },
      {
        h: "4. Envío",
        p: [
          "Realizamos envíos nacionales e internacionales. Los plazos de entrega son estimados y pueden variar según las condiciones del transportista, los trámites aduaneros (para pedidos internacionales) o causas de fuerza mayor.",
          "El cliente es responsable de proporcionar una dirección de entrega correcta. No nos hacemos responsables de retrasos o pérdidas de envío causados por datos de envío incorrectos.",
        ],
      },
      {
        h: "5. Devoluciones y garantía",
        p: [
          "Por favor, graba un video al desempaquetar tu pedido. Si el artículo presenta un defecto de fabricación o se envió el producto equivocado, ofreceremos un cambio 1 por 1 tras verificar el video o las fotos que nos proporciones.",
          "No aceptamos devoluciones por cambio de opinión una vez abierta la caja, salvo en los casos de producto defectuoso o incorrecto descritos anteriormente.",
        ],
      },
      {
        h: "6. Propiedad intelectual",
        p: [
          "Todo el contenido, imágenes y logotipos de este sitio son propiedad de GM Model o están utilizados bajo licencia. Queda prohibida su reproducción o redistribución con fines comerciales sin autorización previa.",
        ],
      },
      {
        h: "7. Limitación de responsabilidad",
        p: [
          "GM Model no se hace responsable de daños indirectos derivados del uso de este sitio web o de sus productos, salvo lo que disponga en contrario la legislación vietnamita aplicable.",
        ],
      },
      {
        h: "8. Cambios en estos términos",
        p: ["Podemos actualizar estos términos periódicamente. La versión más reciente siempre estará publicada en esta página."],
      },
      {
        h: "9. Contacto",
        p: ["Si tienes preguntas sobre estos términos, contáctanos a través de nuestra página de Contacto o al teléfono +84 347 347 823."],
      },
    ],
  },
};

export default function TermsPageClient() {
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
