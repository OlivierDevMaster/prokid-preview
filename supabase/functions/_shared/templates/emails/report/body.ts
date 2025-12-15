export const reportBodyTemplate = `          <!-- Body content -->
          <tr>
            <td style="padding: 40px;">
              <!-- Professional Information -->
              <table role="presentation" style="width: 100%; border-collapse: collapse; margin-bottom: 25px; background-color: #f8f9fa; border-radius: 8px; overflow: hidden;">
                <tr>
                  <td style="padding: 20px; border-left: 4px solid #558cc9;">
                    <h2 style="margin: 0 0 15px 0; color: #2c3e50; font-size: 20px; font-weight: 600;">Informations du professionnel</h2>
                    <table role="presentation" style="width: 100%; border-collapse: collapse;">
                      <tr>
                        <td style="padding: 8px 0; color: #555; font-size: 14px;"><strong style="color: #2c3e50;">Nom:</strong></td>
                        <td style="padding: 8px 0; color: #333; font-size: 14px;">{{professional_name}}</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: #555; font-size: 14px;"><strong style="color: #2c3e50;">Email:</strong></td>
                        <td style="padding: 8px 0; color: #333; font-size: 14px;"><a href="mailto:{{professional_email}}" style="color: #558cc9; text-decoration: none;">{{professional_email}}</a></td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Mission Information -->
              <table role="presentation" style="width: 100%; border-collapse: collapse; margin-bottom: 25px; background-color: #f8f9fa; border-radius: 8px; overflow: hidden;">
                <tr>
                  <td style="padding: 20px; border-left: 4px solid #82c4c1;">
                    <h2 style="margin: 0 0 15px 0; color: #2c3e50; font-size: 20px; font-weight: 600;">Informations de la mission</h2>
                    <table role="presentation" style="width: 100%; border-collapse: collapse;">
                      <tr>
                        <td style="padding: 8px 0; color: #555; font-size: 14px;"><strong style="color: #2c3e50;">Titre:</strong></td>
                        <td style="padding: 8px 0; color: #333; font-size: 14px;">{{mission_title}}</td>
                      </tr>
                      {{#mission_description}}
                      <tr>
                        <td style="padding: 8px 0; color: #555; font-size: 14px; vertical-align: top;"><strong style="color: #2c3e50;">Description:</strong></td>
                        <td style="padding: 8px 0; color: #333; font-size: 14px;">{{mission_description}}</td>
                      </tr>
                      {{/mission_description}}
                      <tr>
                        <td style="padding: 8px 0; color: #555; font-size: 14px;"><strong style="color: #2c3e50;">Date de début:</strong></td>
                        <td style="padding: 8px 0; color: #333; font-size: 14px;">{{mission_start_date}}</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: #555; font-size: 14px;"><strong style="color: #2c3e50;">Date de fin:</strong></td>
                        <td style="padding: 8px 0; color: #333; font-size: 14px;">{{mission_end_date}}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Report Content -->
              <table role="presentation" style="width: 100%; border-collapse: collapse; margin-bottom: 25px;">
                <tr>
                  <td>
                    <h2 style="margin: 0 0 15px 0; color: #2c3e50; font-size: 20px; font-weight: 600;">Contenu du rapport</h2>
                    <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; border-left: 4px solid #558cc9; white-space: pre-wrap; color: #333; font-size: 14px; line-height: 1.7;">
                      {{{report_content}}}
                    </div>
                  </td>
                </tr>
              </table>

              {{#has_attachments}}
              <!-- Attachments -->
              <table role="presentation" style="width: 100%; border-collapse: collapse; margin-bottom: 25px; background-color: #f8f9fa; border-radius: 8px; overflow: hidden;">
                <tr>
                  <td style="padding: 20px; border-left: 4px solid #82c4c1;">
                    <h3 style="margin: 0 0 15px 0; color: #2c3e50; font-size: 18px; font-weight: 600;">Pièces jointes ({{attachments_count}})</h3>
                    <ul style="margin: 0; padding-left: 20px; color: #333; font-size: 14px;">
                      {{#attachments}}
                      <li style="margin: 8px 0; line-height: 1.6;">{{file_name}} <span style="color: #999;">({{file_size_kb}} KB)</span></li>
                      {{/attachments}}
                    </ul>
                  </td>
                </tr>
              </table>
              {{/has_attachments}}
            </td>
          </tr>

`;
